const Fastify = require('fastify');
const websocketPlugin = require('@fastify/websocket');

async function start() {
  // Create Fastify instance
  const app = Fastify();

  // Register websocket plugin and routes
  app.register(websocketPlugin);
  app.register(require('./ws')); // your websocket handlers

  // Start server
  await app.listen({ port: 3001, host: '0.0.0.0' });

  console.log('WebSocket server listening on ws://0.0.0.0:3001/ws/game');
}

// Start everything and catch errors
start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
