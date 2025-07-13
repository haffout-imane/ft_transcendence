const players = new Map(); // key: playerId, value: { socket, status }

function addPlayer(playerId, socket) {
  players.set(playerId, { socket, status: 'idle', playerDbUUID: null });
  console.log(`this is the players map:`, players);
}

function removePlayer(playerId) {
  players.delete(playerId);
}

function getPlayer(playerId) {
  return players.get(playerId);
}

// add playerdbUUID to the player object
function addPlayerDbUUID(playerId, playerDbUUID) {
  const player = players.get(playerId);
  if (player) {
    player.playerDbUUID = playerDbUUID;
  } else {
    console.warn(`Player ${playerId} not found when trying to add playerDbUUID`);
  }
}

function returnsetf(playerId) {	
	return playerId;
}

function setPlayerStatus(playerId, status) {
  const player = players.get(playerId);
  if (player) player.status = status;
  else console.warn(`Player ${playerId} not found when trying to set status to ${status}`);
}

function updatePlayerToken(oldPlayerId, newPlayerId) {
	if (!players.has(oldPlayerId)) {
	  console.warn(`⚠️ No player found with ID ${oldPlayerId}`);
	  return;
	}
  
	// Get the existing player data
	const playerData = players.get(oldPlayerId);
  
	// Delete the old entry
	players.delete(oldPlayerId);
  
	// Add the new entry
	players.set(newPlayerId, playerData);
  
	console.log(`✅ Player ID updated from ${oldPlayerId} to ${newPlayerId}`);
	console.log('🧾 Current players map:', players);
  }
  

// function updatePlayerToken(playerId, token) {
//   const player = players.get(playerId);
//   if (player) {
//     player.playerId = token; // Assuming you want to store a token for the player
//   }
  
// }

function getAllPlayers() {
  return Array.from(players.entries());
}

module.exports = {
  addPlayer,
  removePlayer,
  getPlayer,
  setPlayerStatus,
  getAllPlayers,
  updatePlayerToken,
  returnsetf,
  addPlayerDbUUID
};
