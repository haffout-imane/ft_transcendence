const fastify = require('fastify')({ logger: true });
const { time } = require('console');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const prisma = require('./db');
const { get } = require('http');

// Register WebSocket support
fastify.register(require('@fastify/websocket'));


// Store connected clients
const clients = new Map();

// WebSocket route for chat
fastify.register(async function (fastify) {
  fastify.get('/ws/chat', { websocket: true }, (connection, req) => {
    const clientId = uuidv4();
    let userDbUUID = null; // Initialize userDbUUID to null
    
    async function getUserIdByUsername(username) {
      return await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      }).then(user => user ? user.id : null);
    }
    
    // Store client connection
    clients.set(clientId, {
      connection,
      username: null,
      id: clientId,
      userDbUUID
    });

    console.log(`Client ${clientId} connected!!!!`);

    connection.socket.send(JSON.stringify({
      type: 'welcome',
      data: { clientId }
    }));

    connection.socket.on('message', ( message ) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received message from ${clientId}:`, data);
        switch (data.type) {
          case 'auth':
            handleAuthentication(clientId, data.username);
            break;
          case 'message':
            handleMessage(clientId, data.message, data.to);
            break;
          case 'notification':
            handleNotif(clientId, "friend request", data.to);
            break;
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    connection.socket.on('close', () => {
      console.log(`Client ${clientId} disconnected`);
      clients.delete(clientId);
    });

    // Helper functions
    function handleAuthentication(clientId, userName) {
      const client = clients.get(clientId);
      if (!client)
      {
        console.warn(`Client ${clientId} not found for authentication`);
        return;
      }

      getUserIdByUsername(userName).then(userDbUUID => {
        if (!userDbUUID) {
          console.warn(`User ${userName} not found in database`);
          connection.socket.send(JSON.stringify({
            type: 'error',
            message: `User ${userName} not found`
          }));
          return;
        }
        client.userDbUUID = userDbUUID; // Store userDbUUID in the client object
      }
      ).catch(err => {
        console.error(`Error retrieving user ID for ${userName}:`, err);
        connection.socket.send(JSON.stringify({
          type: 'error',
          message: `Error retrieving user ID for ${userName}`
        }));
      }
      );
      console.log(`Client ${clientId} authenticated as ${userName}`);
      client.username = userName;
      // username = userName;

      // Notify client of successful join
      client.connection.socket.send(JSON.stringify({
        type: 'authenticated',
        username: userName
      }));
    }

    async function handleNotif(clientId, message, to) {
      const client = clients.get(clientId);
      if (!client) return;
      const notifmessage = {
        type: 'notification',
        from: client.username,
        message: message
      };
      // add notification to database
      const senderId = client.userDbUUID || null; // Use userDbUUID if available
      const receiverId = findClientByUsername(to)?.userDbUUID || null; // Use userDbUUID of recipient if available
      await prisma.notification.create({
        data: {
          senderId,
          receiverId,
          message: message
        }
      }).then(() => {
        console.log(`Notification from ${client.username} to ${to}: ${message}`);
      }).catch(err => {
        console.error(`Error saving notification from ${client.username} to ${to}:`, err);
      });
      // broadcast to the client
      broadcastTo(client.username, to, notifmessage, "notification");
    }

    async function handleMessage(clientId, message, to) {
      const client = clients.get(clientId);
      if (!client) return;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const chatMessage = {
        type: 'message',
        from: client.username,
        message: message,
        timestamp
      };
      // add to database
      const senderId = client.userDbUUID;  // Use userDbUUID if available
      if (!senderId){
        console.error('Sender ID is not available for client:', clientId);
      }
      
      const chatId = await findChatBetweenUsers(senderId, findClientByUsername(to).userDbUUID);
      if (!chatId) {
        console.error(`Chat not found between ${senderId} and ${to}`);
        return;
      }
      await prisma.message.create({
        data: {
          content: message,
          senderId: senderId,
          chatId: chatId
        }
      }).then(() => {
        console.log(`Message from ${client.username} to ${to}: ${message}`);
      }).catch(err => {
        console.error(`Error saving message from ${client.username} to ${to}:`, err);
      });
      broadcastTo(client.username, to, chatMessage, "message");
    }
  });

  async function findChatBetweenUsers(userId1, userId2) {
    const chat = await prisma.chat.findFirst({
      where: {
        users: {
          every: {
            id: {
              in: [userId1, userId2],
            },
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
          },
        },
      },
    });

    // Verify that the chat has exactly the two users
    if (chat && chat.users.length === 2 && chat.users.some(u => u.id === userId1) && chat.users.some(u => u.id === userId2)) {
      return chat.id;
    }

    return null; // No chat found
  }

});

// Helper functions
function broadcastTo(from, to, message, type) {
  if (!findClientByUsername(to)) 
  {
    console.warn(`Client ${to} not found for broadcasting message`);
    return;
  }
  const client = findClientByUsername(to);
  // sent message to the client
  if (client && client.connection.socket.readyState === 1) {
    client.connection.socket.send(JSON.stringify({
      type: type,
      ...message,
      from,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})
    }));
  } else {
    console.warn(`Client ${to} is not connected`);
  }
}

function findClientByUsername(username) {
  for (const client of clients.values()) {
    if (client.username === username) {
      return client; // or return client.id if you only want the ID
    }
  }
  return null; // if not found
}

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3002, host: '0.0.0.0' });
    console.log('Chat server running on http://localhost:3002');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();