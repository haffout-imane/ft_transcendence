const { v4: uuidv4 } = require('uuid');
const playerManager = require('./playerManager');

const matches = new Map(); // matchId -> match object
const waitingQueue = {
  '1v1': [],
  '2v2': []
};

function joinMatch(connection, playerId, type = '1v1') {
  const queue = waitingQueue[type];
  console.log(`Player ${playerId} is trying to join a ${type} match`);  
  if (queue.includes(playerId)) {
	console.log(`Player ${playerId} is already in the queue for a ${type} match`);

	connection.send(JSON.stringify({
	  type: 'error',
	  data: { message: `You are already in the queue for a ${type} match` }
	}));
    return null; // Player is already in the queue
  }
  console.log(`Adding player ${playerId} to the queue for a ${type} match`);
  queue.push(playerId);

  // Notify the player that they have joined the queue
  connection.send(JSON.stringify({
	type: 'queue_joined',
	data: { type, waiting: true }
  }));

  const requiredPlayers = type === '1v1' ? 2 : 4;

  if (queue.length >= requiredPlayers) {
	console.log(`Creating a ${type} match with players:`, queue.slice(0, requiredPlayers));
    const players = queue.splice(0, requiredPlayers);


	// see if the queue still has players left
	if (queue.length > 0) {
		console.log(`There are still ${queue.length} players left in the queue for a ${type} match`);
		console.log(`Remaining players in the queue:`, queue);
	}

    const matchId = uuidv4();
    const match = {
      id: matchId,
      players,
      status: 'ready',
      type
    };
    matches.set(matchId, match);

    // Update player status
    players.forEach(p => {
		console.log(`Setting player ${p} status to in-match:${matchId}`);
		playerManager.setPlayerStatus(p, `in-match:${matchId}`)
	});

    // Notify players that they are ready to play
    players.forEach(p => {
      const entry = playerManager.getPlayer(p);
      if (entry) {
        entry.socket.send(JSON.stringify({
          type: 'match_ready',
          data: { matchId, players }
        }));
      }
    });

    return match;
  }

  return null;
}

function getPlayerMatch(playerId) {
  for (const m of matches.values()) {
    if (m.players.includes(playerId)) {
      return m;
    }
  }
  return null;
}

function removePlayerFromWaitingQueue(playerId, type = '1v1') {
  const queue = waitingQueue[type];
  const index = queue.indexOf(playerId);
  if (index !== -1) {
	queue.splice(index, 1);
	console.log(`Removed player ${playerId} from the ${type} waiting queue`);
  } else {
	console.warn(`Player ${playerId} not found in the ${type} waiting queue`);
  }
}

function getMatch(matchId) {
  return matches.get(matchId);
}

function removeMatch(matchId) {
  matches.delete(matchId);
}

module.exports = {
  joinMatch,
  getMatch,
  removeMatch,
  getPlayerMatch,
  removePlayerFromWaitingQueue
};
