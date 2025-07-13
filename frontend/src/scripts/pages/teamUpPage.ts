// offlinePage.ts

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

export function renderTeamUpPage() {
    const app = document.getElementById("main-page");
    if (!app) return;
    app.innerHTML = `
    <div class="animation-backround">
        <div id="countdown" class="countdown">3</div> <!-- Countdown div here -->
        <div class="pong-container">
        <div class="scoreboard">
            <div class="game-score left">
                <span class="player-name">Team 1</span>
                <span class="score-value right" id="team1-score">0</span>
            </div>
            <div class="game-logo">
                <img src="/assets/logo.png" alt="logo" class="logo-icon" />
            </div>
            <div class="game-score right">
                <span class="score-value left" id="team2-score">0</span>
                <span class="player-name">Team 2</span>
            </div>
        </div>
            <canvas id="pong-canvas" width="2000" height="1000"></canvas>
            <div class="controls-info">
                <div>Team 1: Player 1 (W/S), Player 2 (O/L)</div>
                <div>Team 2: Player 3 (↑/↓), Player 4 (8/5)</div>
            </div>
            <div class="exit-game" id="exit-game">
              <button id="exit-game-btn">Exit Game</button>
            </div>

            <div id="game-over-modal" class="game-over-modal hidden">
                <div class="modal-content">
                    <h2 id="winner-text">Team 1 Wins!</h2>
                    <button id="restart-btn" class="restart-btn">Play Again</button>
                    <button id="exit-btn" class="confirm-btn">Exit</button>
                </div>
            </div>

            <div id="exit-confirmation-modal" class="exit-confirmation-modal hidden">
                <div class="modal-content">
                    <h2>Exit Game?</h2>
                    <p>Are you sure you want to exit the game?.</p>
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

    // Initialize the game after
    setTimeout(() => {
        initPongGame();
    }, 3000);
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
        team1: {
            near: { x: number; y: number; width: number; height: number; speed: number; };
            far: { x: number; y: number; width: number; height: number; speed: number; };
        };
        team2: {
            near: { x: number; y: number; width: number; height: number; speed: number; };
            far: { x: number; y: number; width: number; height: number; speed: number; };
        };
    };
    score: {
        team1: number;
        team2: number;
    };
    keys: { [key: string]: boolean };
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    gameRunning: boolean;
    gameOver: boolean;
    winner: string;
    isPaused: boolean;
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
            team1: {
                near: {
                    x: 30,
                    y: canvas.height / 2 - 50,
                    width: 25,
                    height: 100,
                    speed: 12
                },
                far: {
                    x: 380,
                    y: canvas.height / 2 - 50,
                    width: 25,
                    height: 100,
                    speed: 12
                }
            },
            team2: {
                near: {
                    x: canvas.width - 55,
                    y: canvas.height / 2 - 50,
                    width: 25,
                    height: 100,
                    speed: 12
                },
                far: {
                    x: canvas.width - 405,
                    y: canvas.height / 2 - 50,
                    width: 25,
                    height: 100,
                    speed: 12
                }
            }
        },
        score: {
            team1: 0,
            team2: 0
        },
        keys: {},
        canvas,
        ctx,
        gameRunning: true,
        gameOver: false,
        winner: '',
        isPaused: false
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

        if (!gameState.isPaused)
            update(gameState);

        render(gameState);
        requestAnimationFrame(gameLoop);
    }

    // Start the game
    ballImage.onload = () => {
        gameLoop();
    };
}


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
    gameState.ball.x = gameState.canvas.width / 2;
    gameState.ball.y = gameState.canvas.height / 2;
    gameState.ball.speed = gameState.ball.baseSpeed;

    // Random direction (left or right)
    const direction = Math.random() < 0.5 ? -1 : 1;
    // Random angle between -45 and 45 degrees
    const angle = (Math.random() - 0.5) * Math.PI / 2;
    
    gameState.ball.dx = Math.cos(angle) * gameState.ball.speed * direction;
    gameState.ball.dy = Math.sin(angle) * gameState.ball.speed;
}

function update(gameState: GameState): void {
    if (gameState.gameOver) return;

    // Team 1 paddle movement
    // Player 1 (W/S) - Near paddle
    if (gameState.keys['w'] && gameState.paddles.team1.near.y > 10) {
        gameState.paddles.team1.near.y -= gameState.paddles.team1.near.speed;
    }
    if (gameState.keys['s'] && gameState.paddles.team1.near.y < gameState.canvas.height - 10 - gameState.paddles.team1.near.height) {
        gameState.paddles.team1.near.y += gameState.paddles.team1.near.speed;
    }

    // Player 2 (P/L) - Far paddle
    if (gameState.keys['o'] && gameState.paddles.team1.far.y > 10) {
        gameState.paddles.team1.far.y -= gameState.paddles.team1.far.speed;
    }
    if (gameState.keys['l'] && gameState.paddles.team1.far.y < gameState.canvas.height - 10 - gameState.paddles.team1.far.height) {
        gameState.paddles.team1.far.y += gameState.paddles.team1.far.speed;
    }

    // Team 2 paddle movement
    // Player 4 (8/5) - Near paddle  
    if (gameState.keys['8'] && gameState.paddles.team2.near.y > 10) {
        gameState.paddles.team2.near.y -= gameState.paddles.team2.near.speed;
    }
    if (gameState.keys['5'] && gameState.paddles.team2.near.y < gameState.canvas.height - 10 - gameState.paddles.team2.near.height) {
        gameState.paddles.team2.near.y += gameState.paddles.team2.near.speed;
    }
    
    // Player 3 (Arrow keys) - Far paddle
    if (gameState.keys['arrowup'] && gameState.paddles.team2.far.y > 10) {
        gameState.paddles.team2.far.y -= gameState.paddles.team2.far.speed;
    }
    if (gameState.keys['arrowdown'] && gameState.paddles.team2.far.y < gameState.canvas.height - 10 - gameState.paddles.team2.far.height) {
        gameState.paddles.team2.far.y += gameState.paddles.team2.far.speed;
    }

    // Ball movement
    gameState.ball.x += gameState.ball.dx;
    gameState.ball.y += gameState.ball.dy;

    // Ball collision with top and bottom walls
    if (gameState.ball.y - gameState.ball.size <= 0 || gameState.ball.y + gameState.ball.size >= gameState.canvas.height) {
        gameState.ball.dy = -gameState.ball.dy;
        gameState.ball.y = Math.max(gameState.ball.size, Math.min(gameState.canvas.height - gameState.ball.size, gameState.ball.y));
    }

    // Ball collision with paddles - FIXED VERSION
    const ball = gameState.ball;

    // Check collision with Team 1 paddles (left side)
    // When ball is moving left, check paddles in order: near first, then far
    let collisionOccurred = false;

    // Check collision with Team 1 paddles (left side)
    collisionOccurred = checkPaddleCollision(ball, gameState.paddles.team1.near, 'left');
    if (!collisionOccurred) {
        collisionOccurred = checkPaddleCollision(ball, gameState.paddles.team1.far, 'left');
    }

    // Check collision with Team 2 paddles (right side)
    if (!collisionOccurred) {
        collisionOccurred = checkPaddleCollision(ball, gameState.paddles.team2.near, 'right');
        if (!collisionOccurred) {
            checkPaddleCollision(ball, gameState.paddles.team2.far, 'right');
        }
    }

    // Scoring
    if (ball.x < 0) {
        gameState.score.team2++;
        updateScore(gameState);
        checkGameOver(gameState);
        if (!gameState.gameOver) {
            resetBall(gameState);
        }
    } else if (ball.x > gameState.canvas.width) {
        gameState.score.team1++;
        updateScore(gameState);
        checkGameOver(gameState);
        if (!gameState.gameOver) {
            resetBall(gameState);
        }
    }
}

// FIXED: Now returns boolean to indicate if collision occurred
function checkPaddleCollision(ball: any, paddle: any, side: 'left' | 'right'): boolean {
    const isColliding = ball.x - ball.size <= paddle.x + paddle.width &&
                       ball.x + ball.size >= paddle.x &&
                       ball.y + ball.size >= paddle.y &&
                       ball.y - ball.size <= paddle.y + paddle.height;

    if (isColliding && ((side === 'left' && ball.dx < 0) || (side === 'right' && ball.dx > 0))) {
        // Calculate hit position (0 = top, 1 = bottom)
        const hitPos = (ball.y - paddle.y) / paddle.height;
        const angle = (hitPos - 0.5) * Math.PI * 0.6; // Max 54 degrees
        
        ball.speed += ball.speedIncrement; // Gradual speed increase
        
        if (side === 'left') {
            ball.dx = Math.cos(angle) * ball.speed;
            ball.x = paddle.x + paddle.width + ball.size;
        } else {
            ball.dx = -Math.cos(angle) * ball.speed;
            ball.x = paddle.x - ball.size;
        }
        
        ball.dy = Math.sin(angle) * ball.speed;
        return true; // Collision occurred
    }
    return false; // No collision
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
    
    // Team 1 paddles (left side)
    const team1Near = gameState.paddles.team1.near;
    ctx.beginPath();
    ctx.roundRect(team1Near.x, team1Near.y, team1Near.width, team1Near.height, 10);
    ctx.fill();

    const team1Far = gameState.paddles.team1.far;
    ctx.beginPath();
    ctx.roundRect(team1Far.x, team1Far.y, team1Far.width, team1Far.height, 10);
    ctx.fill();

    // Team 2 paddles (right side)
    const team2Near = gameState.paddles.team2.near;
    ctx.beginPath();
    ctx.roundRect(team2Near.x, team2Near.y, team2Near.width, team2Near.height, 10);
    ctx.fill();

    const team2Far = gameState.paddles.team2.far;
    ctx.beginPath();
    ctx.roundRect(team2Far.x, team2Far.y, team2Far.width, team2Far.height, 10);
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
    const team1Score = document.getElementById('team1-score');
    const team2Score = document.getElementById('team2-score');
    
    if (team1Score) team1Score.textContent = gameState.score.team1.toString();
    if (team2Score) team2Score.textContent = gameState.score.team2.toString();
}

function checkGameOver(gameState: GameState): void {
    const WINNING_SCORE = 7;
    
    if (gameState.score.team1 >= WINNING_SCORE) {
        gameState.gameOver = true;
        gameState.winner = 'Team 1';
        showGameOverModal(gameState);
    } else if (gameState.score.team2 >= WINNING_SCORE) {
        gameState.gameOver = true;
        gameState.winner = 'Team 2';
        showGameOverModal(gameState);
    }
}

function showGameOverModal(gameState: GameState): void {
    const modal = document.getElementById('game-over-modal');
    const winnerText = document.getElementById('winner-text');
    
    if (modal && winnerText) {
        winnerText.textContent = `${gameState.winner} Wins!`;
        modal.classList.remove('hidden');
    }
}

function restartGame(gameState: GameState): void {
    // Reset scores
    gameState.score.team1 = 0;
    gameState.score.team2 = 0;
    
    // Reset game state
    gameState.gameOver = false;
    gameState.winner = '';
    gameState.isPaused = false;
    
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