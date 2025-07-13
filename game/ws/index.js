const handlers = require('./handlers');
const playerManager = require('./playerManager');
const matchManager = require('./matchManager');
const { v4: uuidv4 } = require('uuid'); // npm i uuid

module.exports = async function (fastify) {
  fastify.get('/ws/game', { websocket: true }, async (connection, req) => {
    

    let playerId = uuidv4(); // In future: extract from token
    playerManager.addPlayer(playerId, connection);

    console.log(`🔌 Player ${playerId} connected`);

    connection.send(JSON.stringify({
      type: 'welcome',
      data: { playerId }
    }));

    connection.on('message', async (messageBuffer) => {
      let message;
      try {
        message = JSON.parse(messageBuffer.toString());
      } catch (err) {
        return connection.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid JSON' }
        }));
      }

      const handler = handlers[message.type];
      if (handler) {
        await handler(connection, message.data, req, playerId);
      } else {
        connection.send(JSON.stringify({
          type: 'error',
          data: { message: `Unknown message type: ${message.type}` }
        }));
      }
    });

    connection.on('close', async () => {
      console.log(`❌ Player ${playerId} disconnected`);
    //   playerManager.removePlayer(playerId);
	//   matchManager.removePlayerFromWaitingQueue(playerId);`
    });

    connection.on('error', err => {
      console.error(`WebSocket error [${playerId}]:`, err);
    });
  });
};
