const WebSocket = require('ws');

// Create a WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

console.log("WebSocket server is running on ws://localhost:8080");

wss.on('connection', (ws) => {
  console.log("New client connected");

  // Send a welcome message to the client
  // ws.send("Welcome to the WebSocket server!");

  // sending a test to the user 

  // first wait for 5s before sending the message
  
  let chat ={
    "type": "chat",
     payload: {
      "from": "Alice",
      "text": "Hello, Bob! How are you?",
      "timestamp": new Date().toISOString(),
     }
};
  ws.send(JSON.stringify(chat));



  // Handle messages received from the client
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
  
    ws.send(`Server received: ${message}`);
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log("Client disconnected");
  });

    //handle 

});

// we run by the command // node server.js