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

let player1_slogan: string;
let player2_slogan: string;
    
export function renderTournamentGame(player1: string, player2: string): Promise<string>{
	return new Promise((resolve) => {
    const app = document.getElementById("main-page");
    if (!app) return;
	player1_slogan = player1;
	player2_slogan = player2;

    app.innerHTML = `
    <div class="animation-backround2">
    	<div class="pong-container2">
    		<div class="scoreboard">
    			<div class="game-score left">
    				<span class="player-name">${player1}</span>
    				<span class="score-value right" id="player1-score">0</span>
    			</div>
    		<div class="game-logo">
    			<img src="/assets/logo.png" alt="logo" class="logo-icon" />
   			</div>
    		<div class="game-score right">
				<span class="score-value left" id="player2-score">0</span>
				<span class="player-name">${player2}</span>
    		</div>
    	</div>
    	<canvas id="pong-canvas" width="2000" height="1000"></canvas>
    	<div class="controls-info">
    		<div>Player 1: W/S</div>
    		<div>Player 2: ↑/↓</div>
    	</div>

    
		<div id="game-over-modal" class="game-over-modal hidden">
			<div class="modal-content">
				<h2 id="winner-text">Player 1 Wins!</h2>
				<button id="restart-btn" class="restart-btn">Play Again</button>
				<button id="exit-btn" class="confirm-btn">Exit</button>
			</div>
		</div>
    </div>
    `;
    
    
        initPongGame(resolve);

});
    
    
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
    isPaused: boolean;
}

async function initPongGame(resolve: (winner: string) => void): Promise<void> {
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

    // Exit button event listener (for manual exit if needed)
    document.getElementById('exit-btn')?.addEventListener('click', () => {
        gameState.gameRunning = false;
        resolve(gameState.winner);
    });

    // Game loop
    function gameLoop(): void {
        if (!gameState.gameRunning) return;

        if (!gameState.isPaused) {
            update(gameState);
            if (gameState.gameOver) {
                // Game is over, resolve immediately with the winner
                resolve(gameState.winner);
                return;
            }
        }

        render(gameState);
        requestAnimationFrame(gameLoop);
    }

    // Start the game
    ballImage.onload = () => {
        gameLoop();
    };
}

function resetBall(gameState: GameState): void {
    // Reset ball position and speed
    gameState.ball.x = gameState.canvas.width / 2;
    gameState.ball.y = gameState.canvas.height / 2;
    gameState.ball.speed = gameState.ball.baseSpeed;

    // Temporarily stop ball movement
    gameState.ball.dx = 0;
    gameState.ball.dy = 0;

    // Wait for 0.5 seconds before setting the ball's direction
    setTimeout(() => {
        // Random direction (left or right)
        const direction = Math.random() < 0.5 ? -1 : 1;
        // Random angle between -45 and 45 degrees
        const angle = (Math.random() - 0.5) * Math.PI / 2;

        gameState.ball.dx = Math.cos(angle) * gameState.ball.speed * direction;
        gameState.ball.dy = Math.sin(angle) * gameState.ball.speed;
    }, 1000);
}

function update(gameState: GameState): void {
    if (gameState.gameOver) return;

    // Paddle movement
    if (gameState.keys['w'] && gameState.paddles.left.y > 10) {
        gameState.paddles.left.y -= gameState.paddles.left.speed;
    }
    if (gameState.keys['s'] && gameState.paddles.left.y < gameState.canvas.height -10 - gameState.paddles.left.height) {
        gameState.paddles.left.y += gameState.paddles.left.speed;
    }
    if (gameState.keys['arrowup'] && gameState.paddles.right.y > 10) {
        gameState.paddles.right.y -= gameState.paddles.right.speed;
    }
    if (gameState.keys['arrowdown'] && gameState.paddles.right.y < gameState.canvas.height -10 - gameState.paddles.right.height) {
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

    // Left paddle collision
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
    }

    // Right paddle collision
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
    }

    // Scoring
    if (ball.x < 0) {
        gameState.score.player2++;
        updateScore(gameState);
        checkGameOver(gameState);
        if (!gameState.gameOver) {
            resetBall(gameState);
        }
    } else if (ball.x > gameState.canvas.width) {
        gameState.score.player1++;
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
    
    // Left paddle
    const leftPaddle = gameState.paddles.left;
    ctx.beginPath();
    ctx.roundRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, 10);
    ctx.fill();

    // Right paddle
    const rightPaddle = gameState.paddles.right;
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
        gameState.winner = player1_slogan;
    } else if (gameState.score.player2 >= WINNING_SCORE) {
        gameState.gameOver = true;
        gameState.winner = player2_slogan;
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
    gameState.score.player1 = 0;
    gameState.score.player2 = 0;
    
    // Reset game state
    gameState.gameOver = false;
    gameState.winner = '';
    gameState.isPaused = false;
    gameState.gameRunning = true;  // Re-enable the game loop
    
    // Reset ball
    resetBall(gameState);
    
    // Update UI
    updateScore(gameState);
    
    // Hide modal
    const modal = document.getElementById('game-over-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    // Restart the game loop
    function gameLoop(): void {
        if (!gameState.gameRunning) return;

        if (!gameState.isPaused) {
            update(gameState);
            if (gameState.gameOver) {
                showGameOverModal(gameState);
                return;
            }
        }

        render(gameState);
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
}

