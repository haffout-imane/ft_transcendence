const playerManager = require('./playerManager');
const matchManager = require('./matchManager');
const gameManager = require('./gameManager');

module.exports = {
  ping(connection, data, req, playerId) {
    connection.send(JSON.stringify({
      type: 'pong',
      data: { received: Date.now(), from: playerId }
    }));
  },

  leave(connection, data, req, playerId) {
    // Remove player from match if they are in one
    const match = matchManager.getPlayerMatch(data.username);
    if (match) {
      console.log(`Player ${data.username} is leaving match ${match.id}`);
      matchManager.removeMatch(match.id);
    }
	else
	{
		console.log(`Player ${data.username} is leaving the game`);
		matchManager.removePlayerFromWaitingQueue(data.username);
	}

    // Remove player from playerManager
    playerManager.removePlayer(data.username);
	connection.send(JSON.stringify({
	  type: 'left',
	  data: { message: `Player ${data.username} has left the game` }
	}));
  },
  
  auth(connection, data, req, playerId) {
    //update playerId in playerManager with the new data.token
    if (!data || !data.token) {
      return connection.send(JSON.stringify({
        type: 'error',
        data: { message: 'Token is required' }
      }));
    }
    const token = data.token;
    playerManager.updatePlayerToken(playerId, token);
  },


  join_match(connection, data, req, playerId) {
    const type = data?.type === '2v2' ? '2v2' : '1v1';
    const match = matchManager.joinMatch(connection, data.username, type);

    connection.send(JSON.stringify({
      type: 'match_joined',
      data: { waiting: !match }
    }));
  },

  match_ready(connection, data, req, playerId) {
    const match = matchManager.getPlayerMatch(data.username);
    if (match && match.status === 'ready') {
      match.status = 'playing';
      gameManager.startGame(match);
    }
  },

  player_input(connection, data, req, playerId) {
    // data = { y: number }
    if (!data || typeof data.y !== 'number') {
      return connection.send(JSON.stringify({
        type: 'error',
        data: { message: `Invalid input data: ${JSON.stringify(data)} and typeof y is ${typeof data.y}` }
      }));
    }
    else
      console.log(`Player ${data.username} input:`, data.y);
    gameManager.updatePaddle(data.matchId, data.username, data.y);
  },

};