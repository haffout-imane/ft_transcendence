import { getTheme } from "../utils/theme.js";

let PaddleColor: string;
let MatchBall: string;

async function loadTheme() {
    try { 
        const theme = await getTheme();
        if (theme)
        {
            MatchBall = theme.MatchBall;
            PaddleColor = theme.PaddleColor;
        }
    }
    catch (error) {
        console.error("Error loading theme:", error);
    }
    
}

loadTheme();

export function renderAiBotPage() {
    // offlinePage.ts
    const app = document.getElementById("main-page");
    if (!app) return;
  
    app.innerHTML = `
    <div class="animation-backround">
        <div id="countdown" class="countdown">3</div> <!-- Countdown div here -->
        <div class="pong-container">
        <div class="scoreboard">
            <div class="game-score left">
                <span class="player-name">You</span>
                <span class="score-value right" id="player1-score">0</span>
            </div>
            <div class="game-logo">
                <img src="/assets/logo.png" alt="logo" class="logo-icon" />
            </div>
            <div class="game-score right">
                <span class="score-value left" id="player2-score">0</span>
                <span class="player-name">AI Bot</span>
            </div>
        </div>
            <canvas id="pong-canvas" width="2000" height="1000"></canvas>
            <div class="controls-info">
                <div>Player: W/S or ↑/↓</div>
                <div>Bot: AI Controlled</div>
            </div>
            <div class="exit-game" id="exit-game">
              <button id="exit-game-btn">Exit Game</button>
            </div>
  
            <div id="game-over-modal" class="game-over-modal hidden">
                <div class="modal-content">
                    <h2 id="winner-text">You Won!</h2>
                    <button id="restart-btn" class="restart-btn">Play Again</button>
                    <button id="exit-btn" class="confirm-btn">Exit</button>
                </div>
            </div>
  
            <div id="exit-confirmation-modal" class="exit-confirmation-modal hidden">
                <div class="modal-content">
                    <h2>Exit Game?</h2>
                    <p>Are you sure you want to exit the game? the game will be considered lost 7-0.</p>
                    <div class="modal-buttons">
                        <button id="exit-confirm-btn" class="confirm-btn">Yes, Exit</button>
                        <button id="exit-cancel-btn" class="cancel-btn">No, Continue</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `;
    startCountdown();
    // Initialize the game after 1s
    setTimeout(() => {
        initPongGame();
    }, 3000);
  }
  
  interface BotAI {
      targetY: number;
      reactionDelay: number;
      lastReactionTime: number;
      baseReactionDelay: number;
      maxSpeed: number;
      currentSpeed: number;
      predictedY: number;
      trackingAccuracy: number;
      reactionVariability: number;
      speedLimiter: number;
      predictionDepth: number;
      fatigueLevel: number;
      lastBallDirection: number;
      
      // NEW: Keyboard simulation properties
      currentKeyPress: string | null; // 'up', 'down', or null
      keyPressStartTime: number;
      keyPressDuration: number;
      lastGameStateSnapshot: {
        ballX: number;
        ballY: number;
        ballDx: number;
        ballDy: number;
        timestamp: number;
      };
    }
  
  interface GameState {
    ball: {
        x: number;
        y: number;
        dx: number;
        dy: number;
        speed: number;
        baseSpeed: number;
        speedIncrement: number;
        image: HTMLImageElement;
        size: number;
    };
    paddles: {
        left: { x: number; y: number; width: number; height: number; speed: number; };
        right: { x: number; y: number; width: number; height: number; speed: number; };
    };
    score: {
        player1: number;
        player2: number;
    };
    keys: { [key: string]: boolean };
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    gameRunning: boolean;
    gameOver: boolean;
    winner: string;
    bot: BotAI;
    isPaused: boolean; // NEW: Track if game is paused
  }
  
  function initPongGame(): void {
    const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    
    if (!canvas || !ctx) {
        console.error('Canvas not found or context not available');
        return;
    }
  
    // Create ball image
    const ballImage = new Image();
    ballImage.src = MatchBall; // ball Image
  
    const gameState: GameState = {
        ball: {
            x: canvas.width / 2,
            y: canvas.height / 2,
            dx: 0,
            dy: 0,
            speed: 17,
            baseSpeed: 17,
            speedIncrement: 0.1,
            image: ballImage,
            size: 20
        },
        paddles: {
            left: {
                x: 30,
                y: canvas.height / 2 - 50,
                width: 25,
                height: 100,
                speed: 12
            },
            right: {
                x: canvas.width - 50,
                y: canvas.height / 2 - 50,
                width: 25,
                height: 100,
                speed: 12
            }
        },
        score: {
            player1: 0,
            player2: 0
        },
        keys: {},
        canvas,
        ctx,
        gameRunning: true,
        gameOver: false,
        winner: '',
        isPaused: false, // NEW: Initialize pause state
        bot: {
          targetY: canvas.height / 2,
          reactionDelay: 200, // Increased from 120ms - slower reactions
          baseReactionDelay: 350, // Increased from 120ms
          lastReactionTime: 0,
          maxSpeed: 8, // Same as player paddle speed
          currentSpeed: 0,
          predictedY: canvas.height / 2,
          trackingAccuracy: 0.6, // Reduced from 0.5 - worse ball tracking (60% vs 50%)
          reactionVariability: 250, // Increased from 150ms - more inconsistent reactions
          speedLimiter: 1.0, // Bot moves at 100% of max speed (same as player)
          predictionDepth: 0.9, // Reduced from 0.5 - much worse at predicting ball path
          fatigueLevel: 0.5, // Increased from 0.3 - starts more "tired"
          lastBallDirection: 1,
          currentKeyPress: null, // Added missing property
          keyPressStartTime: 0, // Added missing property
          keyPressDuration: 0, // Added missing property
          lastGameStateSnapshot: { // Added missing property
            ballX: 0,
            ballY: 0,
            ballDx: 0,
            ballDy: 0,
            timestamp: Date.now()
          }
        }
    };
  
    // Initialize ball direction
    resetBall(gameState);
  
    // Event listeners
    document.addEventListener('keydown', (e) => {
        gameState.keys[e.key.toLowerCase()] = true;
    });
  
    document.addEventListener('keyup', (e) => {
        gameState.keys[e.key.toLowerCase()] = false;
    });
  
    // Restart button event listener
    document.getElementById('restart-btn')?.addEventListener('click', () => {
        restartGame(gameState);
    });
  
    // NEW: Exit button event listeners
    document.getElementById('exit-game-btn')?.addEventListener('click', () => {
        showExitConfirmation(gameState);
    });
  
    document.getElementById('exit-confirm-btn')?.addEventListener('click', () => {
        exitToMainMenu();
    });
    document.getElementById('exit-btn')?.addEventListener('click', () => {
        exitToMainMenu();
    });
  
    document.getElementById('exit-cancel-btn')?.addEventListener('click', () => {
        hideExitConfirmation(gameState);
    });
  
    // Game loop
    function gameLoop(): void {
        if (!gameState.gameRunning) return;
  
        // Only update if not paused
        if (!gameState.isPaused) {
            update(gameState);
        }
        
        render(gameState);
        requestAnimationFrame(gameLoop);
    }
  
    // Start the game
    ballImage.onload = () => {
        gameLoop();
    };
  }
  
  // NEW: Exit confirmation functions
  function showExitConfirmation(gameState: GameState): void {
    gameState.isPaused = true; // Pause the game
    const modal = document.getElementById('exit-confirmation-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
  }
  
  function hideExitConfirmation(gameState: GameState): void {
    gameState.isPaused = false; // Resume the game
    const modal = document.getElementById('exit-confirmation-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
  }
  
  function exitToMainMenu(): void {
    // Redirect to main menu
    window.location.href = '/';
  }
  

  function resetBall(gameState: GameState): void {
    // Reset ball position and speed
    gameState.ball.x = gameState.canvas.width / 2;
    gameState.ball.y = gameState.canvas.height / 2;
    gameState.ball.speed = gameState.ball.baseSpeed;

    // Temporarily stop ball movement
    gameState.ball.dx = 0;
    gameState.ball.dy = 0;

    // Wait for 1 second before setting the ball's direction
    setTimeout(() => {
        // Random direction (left or right)
        const direction = Math.random() < 0.5 ? -1 : 1;
        // Random angle between -45 and 45 degrees
        const angle = (Math.random() - 0.5) * Math.PI / 2;

        gameState.ball.dx = Math.cos(angle) * gameState.ball.speed * direction;
        gameState.ball.dy = Math.sin(angle) * gameState.ball.speed;
    }, 500);
}
  
  function predictBallPosition(gameState: GameState): number {
    const ball = gameState.ball;
    const rightPaddle = gameState.paddles.right;
    const bot = gameState.bot;
    
    // Only predict if ball is moving towards the bot
    if (ball.dx <= 0) {
        // If ball is moving away, follow it slowly (defensive positioning)
        return ball.y + (Math.random() - 0.5) * 100;
    }
  
    // Calculate time to reach paddle
    const timeToReach = (rightPaddle.x - ball.x) / ball.dx;
    
    if (timeToReach <= 0) {
        return ball.y;
    }
  
    // Base prediction
    let predictedY = ball.y + ball.dy * timeToReach;
    
    // Account for bounces off top/bottom walls
    const canvasHeight = gameState.canvas.height;
    const ballSize = ball.size;
    
    // Simple bounce calculation with imperfect prediction
    if (predictedY < ballSize || predictedY > canvasHeight - ballSize) {
        if (predictedY < ballSize) {
            predictedY = ballSize + (ballSize - predictedY);
        } else if (predictedY > canvasHeight - ballSize) {
            predictedY = (canvasHeight - ballSize) - (predictedY - (canvasHeight - ballSize));
        }
        
        // Bot is worse at predicting bounces
        const bounceError = (Math.random() - 0.5) * 60 * (1 - bot.predictionDepth);
        predictedY += bounceError;
    }
  
    // Apply tracking accuracy - bot doesn't always track perfectly
    const trackingError = (Math.random() - 0.5) * 80 * (1 - bot.trackingAccuracy); // Increased from 40
    predictedY += trackingError;
  
    // Add slight delay in updating prediction (simulates processing time)
    const oldPrediction = bot.predictedY;
    const smoothingFactor = 0.3; // How much to blend old vs new prediction
    predictedY = oldPrediction * (1 - smoothingFactor) + predictedY * smoothingFactor;
  
    return Math.max(ballSize, Math.min(canvasHeight - ballSize, predictedY));
  }
  
  function updateBotAI(gameState: GameState): void {
      const currentTime = Date.now();
      const bot = gameState.bot;
      const rightPaddle = gameState.paddles.right;
      const ball = gameState.ball;
      
      // REQUIREMENT: AI can only refresh its view once per second (1000ms)
      const REFRESH_INTERVAL = 1000; // 1 second as required
      
      // Check if it's time to refresh the AI's "view" of the game
      if (currentTime - bot.lastReactionTime >= REFRESH_INTERVAL) {
        
        // Take a "snapshot" of the current game state (AI's limited view)
        bot.lastGameStateSnapshot = {
          ballX: ball.x,
          ballY: ball.y,
          ballDx: ball.dx,
          ballDy: ball.dy,
          timestamp: currentTime
        };
        
        // Based on this snapshot, predict where the ball will be
        bot.predictedY = predictBallPositionFromSnapshot(gameState);
        bot.targetY = bot.predictedY - rightPaddle.height / 2;
        bot.lastReactionTime = currentTime;
        
        // Determine what key to press based on current position vs target
        const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
        const targetCenter = bot.targetY + rightPaddle.height / 2;
        const distance = targetCenter - paddleCenter;
        
        // Decide on keyboard input (simulating human decision-making)
        if (Math.abs(distance) > 10) { // Dead zone to prevent jittering
          if (distance > 0) {
            // Need to move down - simulate pressing 'down' key
            bot.currentKeyPress = 'down';
            bot.keyPressStartTime = currentTime;
            // Vary key press duration based on distance (more human-like)
            bot.keyPressDuration = Math.min(800, Math.max(100, Math.abs(distance) * 3));
          } else {
            // Need to move up - simulate pressing 'up' key  
            bot.currentKeyPress = 'up';
            bot.keyPressStartTime = currentTime;
            bot.keyPressDuration = Math.min(800, Math.max(100, Math.abs(distance) * 3));
          }
        } else {
          // Target reached or close enough - release keys
          bot.currentKeyPress = null;
        }
      }
      
      // REQUIREMENT: Simulate keyboard input instead of direct paddle movement
      simulateKeyboardInput(gameState);
    }
  
    function simulateKeyboardInput(gameState: GameState): void {
      const bot = gameState.bot;
      const currentTime = Date.now();
      
      // Check if we should still be "pressing" a key
      if (bot.currentKeyPress && 
          currentTime - bot.keyPressStartTime < bot.keyPressDuration) {
        
        // Simulate the key press by directly modifying the keys object
        if (bot.currentKeyPress === 'up') {
          gameState.keys['bot_up'] = true;
          gameState.keys['bot_down'] = false;
        } else if (bot.currentKeyPress === 'down') {
          gameState.keys['bot_down'] = true;  
          gameState.keys['bot_up'] = false;
        }
      } else {
        // "Release" all bot keys
        gameState.keys['bot_up'] = false;
        gameState.keys['bot_down'] = false;
        bot.currentKeyPress = null;
      }
    }
  
    function predictBallPositionFromSnapshot(gameState: GameState): number {
      const bot = gameState.bot;
      const snapshot = bot.lastGameStateSnapshot;
      const rightPaddle = gameState.paddles.right;
      const currentTime = Date.now();
      
      // Calculate time elapsed since snapshot
      const timeElapsed = (currentTime - snapshot.timestamp) / 1000; // Convert to seconds
      
      // Predict current ball position based on old data
      let predictedX = snapshot.ballX + snapshot.ballDx * timeElapsed;
      let predictedY = snapshot.ballY + snapshot.ballDy * timeElapsed;
      
      // Only predict if ball is moving towards the bot (based on old data)
      if (snapshot.ballDx <= 0) {
        // Ball moving away - use defensive positioning with uncertainty
        return predictedY + (Math.random() - 0.5) * 150; // More uncertainty
      }
      
      // Calculate time for ball to reach paddle (from predicted position)
      const timeToReach = (rightPaddle.x - predictedX) / snapshot.ballDx;
      
      if (timeToReach <= 0) {
        return predictedY;
      }
      
      // Predict where ball will be when it reaches paddle
      let finalY = predictedY + snapshot.ballDy * timeToReach;
      
      // Account for wall bounces (with more uncertainty due to old data)
      const canvasHeight = gameState.canvas.height;
      const ballSize = gameState.ball.size;
      
      if (finalY < ballSize || finalY > canvasHeight - ballSize) {
        if (finalY < ballSize) {
          finalY = ballSize + (ballSize - finalY);
        } else if (finalY > canvasHeight - ballSize) {
          finalY = (canvasHeight - ballSize) - (finalY - (canvasHeight - ballSize));
        }
        
        // Add significant uncertainty for bounce predictions with old data
        const bounceError = (Math.random() - 0.5) * 120 * (1 - bot.predictionDepth);
        finalY += bounceError;
      }
      
      // Apply tracking accuracy and add error due to using old information
      const trackingError = (Math.random() - 0.5) * 100 * (1 - bot.trackingAccuracy);
      const staleDdataError = (Math.random() - 0.5) * 80; // Additional error from 1-second delay
      finalY += trackingError + staleDdataError;
      
      return Math.max(ballSize, Math.min(canvasHeight - ballSize, finalY));
    }
    
  
    function update(gameState: GameState): void {
      if (gameState.gameOver) return;
    
      // Player paddle movement (left paddle) - unchanged
      if ((gameState.keys['w'] || gameState.keys['arrowup']) && gameState.paddles.left.y > 10) {
          gameState.paddles.left.y -= gameState.paddles.left.speed;
      }
      if ((gameState.keys['s'] || gameState.keys['arrowdown']) && gameState.paddles.left.y < gameState.canvas.height - 10 - gameState.paddles.left.height) {
          gameState.paddles.left.y += gameState.paddles.left.speed;
      }
    
      // Update bot AI (this now simulates keyboard input)
      updateBotAI(gameState);
      
      // REQUIREMENT: Bot paddle movement via simulated keyboard input
      if (gameState.keys['bot_up'] && gameState.paddles.right.y > 10) {
          gameState.paddles.right.y -= gameState.paddles.right.speed;
      }
      if (gameState.keys['bot_down'] && gameState.paddles.right.y < gameState.canvas.height - 10 - gameState.paddles.right.height) {
          gameState.paddles.right.y += gameState.paddles.right.speed;
      }
  
    // Ball movement
    gameState.ball.x += gameState.ball.dx;
    gameState.ball.y += gameState.ball.dy;
  
    // Ball collision with top and bottom walls
    if (gameState.ball.y - gameState.ball.size <= 0 || gameState.ball.y + gameState.ball.size >= gameState.canvas.height) {
        gameState.ball.dy = -gameState.ball.dy;
        gameState.ball.y = Math.max(gameState.ball.size, Math.min(gameState.canvas.height - gameState.ball.size, gameState.ball.y));
    }
  
    // Ball collision with paddles
    const leftPaddle = gameState.paddles.left;
    const rightPaddle = gameState.paddles.right;
    const ball = gameState.ball;
  
    // Left paddle collision (player)
    if (ball.x - ball.size <= leftPaddle.x + leftPaddle.width &&
        ball.x + ball.size >= leftPaddle.x &&
        ball.y + ball.size >= leftPaddle.y &&
        ball.y - ball.size <= leftPaddle.y + leftPaddle.height &&
        ball.dx < 0) {
        
        // Calculate hit position (0 = top, 1 = bottom)
        const hitPos = (ball.y - leftPaddle.y) / leftPaddle.height;
        const angle = (hitPos - 0.5) * Math.PI * 0.6; // Max 54 degrees
        
        ball.speed += ball.speedIncrement; // Gradual speed increase
        ball.dx = Math.cos(angle) * ball.speed;
        ball.dy = Math.sin(angle) * ball.speed;
        ball.x = leftPaddle.x + leftPaddle.width + ball.size;
        
        // Bot gets slightly more confused after ball direction changes
        gameState.bot.fatigueLevel = Math.min(0.5, gameState.bot.fatigueLevel + 0.02);
    }
  
    // Right paddle collision (bot)
    if (ball.x + ball.size >= rightPaddle.x &&
        ball.x - ball.size <= rightPaddle.x + rightPaddle.width &&
        ball.y + ball.size >= rightPaddle.y &&
        ball.y - ball.size <= rightPaddle.y + rightPaddle.height &&
        ball.dx > 0) {
        
        // Calculate hit position (0 = top, 1 = bottom)
        const hitPos = (ball.y - rightPaddle.y) / rightPaddle.height;
        const angle = (hitPos - 0.5) * Math.PI * 0.6; // Max 54 degrees
        
        ball.speed += ball.speedIncrement; // Gradual speed increase
        ball.dx = -Math.cos(angle) * ball.speed;
        ball.dy = Math.sin(angle) * ball.speed;
        ball.x = rightPaddle.x - ball.size;
        
        // Bot recovers a bit after successful hit
        gameState.bot.fatigueLevel = Math.max(0, gameState.bot.fatigueLevel - 0.01);
    }
  
    // Scoring
    if (ball.x < 0) {
        gameState.score.player2++; // Bot scores
        updateScore(gameState);
        checkGameOver(gameState);
        if (!gameState.gameOver) {
            resetBall(gameState);
        }
    } else if (ball.x > gameState.canvas.width) {
        gameState.score.player1++; // Player scores
        updateScore(gameState);
        checkGameOver(gameState);
        if (!gameState.gameOver) {
            resetBall(gameState);
        }
    }
  }
  
  function render(gameState: GameState): void {
    const ctx = gameState.ctx;
    const canvas = gameState.canvas;
  
    // Clear canvas
    ctx.fillStyle = '#9EB9FE'; // table background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Draw center line
    ctx.strokeStyle = '#FFFFFF'; // Set the line color to white
    ctx.lineWidth = 4; // Set the line width
    ctx.setLineDash([]); // Ensure no dashed pattern
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0); // Start at the top center
    ctx.lineTo(canvas.width / 2, canvas.height); // Draw to the bottom center
    ctx.stroke();
  
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2); // Start at the left center
    ctx.lineTo(canvas.width, canvas.height / 2); // Draw to the right center
    ctx.stroke();
  
    // Draw paddles
    ctx.fillStyle = PaddleColor; // Paddle color
    
    // Left paddle (player)
    const leftPaddle = gameState.paddles.left;
    ctx.beginPath();
    ctx.roundRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, 10);
    ctx.fill();
  
    // Right paddle (bot)
    const rightPaddle = gameState.paddles.right;
    ctx.fillStyle = PaddleColor;
    ctx.beginPath();
    ctx.roundRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, 10);
    ctx.fill();
  
    // Draw ball
    const ball = gameState.ball;
    ctx.drawImage(
        ball.image,
        ball.x - ball.size,
        ball.y - ball.size,
        ball.size * 2,
        ball.size * 2
    );
  
    // NEW: Draw pause overlay if game is paused
    if (gameState.isPaused && !gameState.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 6);
    }
  }
  
  function updateScore(gameState: GameState): void {
    const player1Score = document.getElementById('player1-score');
    const player2Score = document.getElementById('player2-score');
    
    if (player1Score) player1Score.textContent = gameState.score.player1.toString();
    if (player2Score) player2Score.textContent = gameState.score.player2.toString();
  }
  
  function checkGameOver(gameState: GameState): void {
    const WINNING_SCORE = 7;
    
    if (gameState.score.player1 >= WINNING_SCORE) {
        gameState.gameOver = true;
        gameState.winner = 'You';
        showGameOverModal(gameState);
    } else if (gameState.score.player2 >= WINNING_SCORE) {
        gameState.gameOver = true;
        gameState.winner = 'AI Bot';
        showGameOverModal(gameState);
    }
  }
  
  function showGameOverModal(gameState: GameState): void {
    const modal = document.getElementById('game-over-modal');
    const winnerText = document.getElementById('winner-text');
    
    if (modal && winnerText) {
        winnerText.textContent = `${gameState.winner} Won!`;
        modal.classList.remove('hidden');
    }
  }
  
  function restartGame(gameState: GameState): void {
    // Reset scores
    gameState.score.player1 = 0;
    gameState.score.player2 = 0;
    
    // Reset game state
    gameState.gameOver = false;
    gameState.winner = '';
    gameState.isPaused = false; // NEW: Ensure game is not paused after restart
    
    // Reset bot AI with some randomization for variety
    gameState.bot.targetY = gameState.canvas.height / 2;
    gameState.bot.lastReactionTime = 0;
    gameState.bot.currentSpeed = 0;
    gameState.bot.fatigueLevel = 0;
    gameState.bot.trackingAccuracy = 0.3 + Math.random() * 0.15; // 60-75% accuracy (was 80-95%)
    gameState.bot.reactionVariability = 100 + Math.random() * 150; // 100-250ms variation (was 60-140ms)
    gameState.bot.speedLimiter = 1.0; // Always 100% speed (same as player)
    gameState.bot.baseReactionDelay = 150 + Math.random() * 100; // 150-250ms base delay (was 100-150ms)as 100-150ms)
    
    // Reset ball
    resetBall(gameState);
    
    // Update UI
    updateScore(gameState);
    
    // Hide modal
    const modal = document.getElementById('game-over-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
  }

  function startCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;
  
    let count = 3;
    countdownEl.textContent = count.toString();
  
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownEl.textContent = count.toString();
      } else {
        clearInterval(interval);
        countdownEl.style.display = 'none'; // hide countdown when done
      }
    }, 1000);
  }