// Fixed gameManager.js
const playerManager = require('./playerManager');
const matchManager = require('./matchManager');
const prisma = require('./db');

const activeGames = new Map(); // matchId -> interval/game state

function startGame(match) {
  console.log(`Starting game for match ${match.id} with players: ${match.players.join(', ')}`);
  const matchId = match.id;
  const width = 2000, height = 1000;
  const baseSpeed = 15;

  const gameState = {
    ball: { 
      x: width / 2, 
      y: height / 2, 
      dx: baseSpeed * (Math.random() > 0.5 ? 1 : -1),
      dy: baseSpeed * (Math.random() - 0.5) * 0.5,
      size: 10,
      speed: baseSpeed,
      baseSpeed: baseSpeed,
      speedIncrement: 0
    },
    paddles: {
      left: { x: 20, y: height / 2 - 50, width: 25, height: 100, speed: 50 },
      right: { x: width - 40, y: height / 2 - 50, width: 25, height: 100, speed: 50 }
    },
    scores: {},
    canvas: { width, height },
    gameOver: false,
    resetInProgress: false,
    // Add player-to-paddle mapping for clarity
    playerPaddles: {
      [match.players[0]]: 'left',
      [match.players[1]]: 'right'
    }
  };

  // Initialize scores with player usernames
  for (const playerId of match.players) {
    gameState.scores[playerId] = 0;
  }

  console.log(`Game initialized with player-paddle mapping:`, gameState.playerPaddles);

  const interval = setInterval(() => {
    updateGame(matchId, gameState, match);
  }, 1000 / 60); // 60 FPS

  activeGames.set(matchId, { match, interval, gameState });
}

function updateGame(matchId, gameState, match) {
  if (gameState.gameOver || gameState.resetInProgress) return;

  const ball = gameState.ball;
  const leftPaddle = gameState.paddles.left;
  const rightPaddle = gameState.paddles.right;

  // Ball movement
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Ball collision with top and bottom walls
  if (ball.y - ball.size <= 0 || ball.y + ball.size >= gameState.canvas.height) {
    ball.dy = -ball.dy;
    ball.y = Math.max(ball.size, Math.min(gameState.canvas.height - ball.size, ball.y));
  }

  // Left paddle collision
  if (ball.x - ball.size <= leftPaddle.x + leftPaddle.width &&
      ball.x + ball.size >= leftPaddle.x &&
      ball.y + ball.size >= leftPaddle.y &&
      ball.y - ball.size <= leftPaddle.y + leftPaddle.height &&
      ball.dx < 0) {
    
    const hitPos = (ball.y - leftPaddle.y) / leftPaddle.height;
    const angle = (hitPos - 0.5) * Math.PI * 0.6;
    
    ball.speed += ball.speedIncrement;
    ball.dx = Math.cos(angle) * ball.speed;
    ball.dy = Math.sin(angle) * ball.speed;
    ball.x = leftPaddle.x + leftPaddle.width + ball.size;
  }

  // Right paddle collision
  if (ball.x + ball.size >= rightPaddle.x &&
      ball.x - ball.size <= rightPaddle.x + rightPaddle.width &&
      ball.y + ball.size >= rightPaddle.y &&
      ball.y - ball.size <= rightPaddle.y + rightPaddle.height &&
      ball.dx > 0) {
    
    const hitPos = (ball.y - rightPaddle.y) / rightPaddle.height;
    const angle = (hitPos - 0.5) * Math.PI * 0.6;
    
    ball.speed += ball.speedIncrement;
    ball.dx = -Math.cos(angle) * ball.speed;
    ball.dy = Math.sin(angle) * ball.speed;
    ball.x = rightPaddle.x - ball.size;
  }

  // Scoring
  if (ball.x < 0) {
    // Right player scores
    const scorer = match.players[1];
    gameState.scores[scorer]++;
    console.log(`Goal! ${scorer} scored. Scores:`, gameState.scores);
    handleGoal(matchId, gameState, match);
  } else if (ball.x > gameState.canvas.width) {
    // Left player scores
    const scorer = match.players[0];
    gameState.scores[scorer]++;
    console.log(`Goal! ${scorer} scored. Scores:`, gameState.scores);
    handleGoal(matchId, gameState, match);
  }

  broadcastGameState(matchId, gameState);
}

function handleGoal(matchId, gameState, match) {
  gameState.resetInProgress = true;
  
  const maxScore = 7;
  const scores = Object.values(gameState.scores);
  if (Math.max(...scores) >= maxScore) {
    gameState.gameOver = true;
    endGame(matchId);
    return;
  }

  setTimeout(() => {
    resetBall(gameState.ball, gameState.canvas);
    gameState.resetInProgress = false;
  }, 1000);
}

function resetBall(ball, canvas) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = ball.baseSpeed;
  
  const angle = (Math.random() - 0.5) * Math.PI * 0.3;
  const direction = Math.random() > 0.5 ? 1 : -1;
  
  ball.dx = Math.cos(angle) * ball.speed * direction;
  ball.dy = Math.sin(angle) * ball.speed;
}

async function endGame(matchId) {
  const gameData = activeGames.get(matchId);
  if (!gameData) return;

  clearInterval(gameData.interval);

  // Send game over messages to players first
  for (const playerId of gameData.match.players) {
    const player = playerManager.getPlayer(playerId);
    console.log(`Sending game over to player ${playerId}`);
    const match = matchManager.getPlayerMatch(playerId);
    if (match && match.status === 'playing') {
      match.status = 'ready';
    }
    if (player) {
      player.socket.send(JSON.stringify({
        type: 'game_over',
        data: {
          scores: gameData.gameState.scores,
          winner: getWinner(gameData.gameState.scores)
        }
      }));
    }
  }

  try {
    // Get player UUIDs from database using async/await
    const player1 = await prisma.user.findUnique({
      where: { username: gameData.match.players[0] },
      select: { id: true }
    });
    
    const player2 = await prisma.user.findUnique({
      where: { username: gameData.match.players[1] },
      select: { id: true }
    });
    
    const winner = await prisma.user.findUnique({
      where: { username: getWinner(gameData.gameState.scores) },
      select: { id: true }
    });
    
    if (!player1 || !player2 || !winner) {
      console.error(`Could not find all players for match ${matchId}`);
      console.error(`Player1: ${player1?.id}, Player2: ${player2?.id}, Winner: ${winner?.id}`);
      activeGames.delete(matchId);
      return;
    }
    
    const player1Score = gameData.gameState.scores[gameData.match.players[0]];
    const player2Score = gameData.gameState.scores[gameData.match.players[1]];

    // Create match record in database
    await prisma.match.create({
      data: {
        player1Id: player1.id,
        player2Id: player2.id,
        player1Score: player1Score,
        player2Score: player2Score,
        winnerId: winner.id
      }
    });
    
    console.log(`Match ${matchId} recorded successfully in database`);
    
  } catch (err) {
    console.error(`Error recording match ${matchId}:`, err);
  }

  activeGames.delete(matchId);
}

function getWinner(scores) {
  const players = Object.keys(scores);
  return scores[players[0]] > scores[players[1]] ? players[0] : players[1];
}

function broadcastGameState(matchId, gameState) {
  const matchData = activeGames.get(matchId);
  if (!matchData) return;

  const gameStateToSend = {
    ball: gameState.ball,
    paddles: gameState.paddles,
    scores: gameState.scores,
    gameOver: gameState.gameOver
  };

  for (const playerId of matchData.match.players) {
    const player = playerManager.getPlayer(playerId);
    if (player) {
      player.socket.send(JSON.stringify({
        type: 'game_state',
        data: gameStateToSend
      }));
    }
  }
}

function updatePaddle(matchId, playerId, y) {
	if (!activeGames.has(matchId)) {
        console.error(`Match ID ${matchId} not found in activeGames.`);
        return; // Exit the function if matchId is invalid
    }

    const { gameState, match } = activeGames.get(matchId);

    // Determine which paddle this player controls
    const paddleSide = playerId === match.players[0] ? 'left' : 'right';
    const paddle = gameState.paddles[paddleSide];

    // Constrain paddle movement within bounds
    const minY = 0;
    const maxY = gameState.canvas.height - paddle.height;
    paddle.y = Math.max(minY, Math.min(maxY, y));
}


function handleGoalScored(playerId) {
  console.log(`Goal scored message received from player ${playerId}`);
}

module.exports = {
  startGame,
  updatePaddle,
  handleGoalScored,
  endGame
};