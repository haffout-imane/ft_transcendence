// onlinePage.ts

import { getTheme } from "../utils/theme.js";
import { socket } from "./matchMakingPage.js";

let PaddleColor: string;
let MatchBall: string;
let currentGameState: OnlineGameState | null = null; // Add this to track current game state
let opponentUsername: string | null = null;


export function handleGameEnd(data: any, MyUsername: string) {

	const modal = document.getElementById('game-over-modal');
    const winnerText = document.getElementById('winner-text');
    
    if (modal && winnerText) {
        if (data.winner === MyUsername) {
            winnerText.textContent = 'You Win!';
        } else {
            winnerText.textContent = 'You Lose!';
        }
        modal.classList.remove('hidden');
    }
    
    // Clear the current game state when game is over
    currentGameState = null;

	// socket?.close();
	socket.send(JSON.stringify({"type":"leave", "data":{"username": MyUsername}}));


}

export function handleGameSocket(data: any, Myusername: string) {
    if (currentGameState) {
        gameUpdate(data, Myusername, currentGameState);
    } else {
        console.warn("No active game state to handle socket message");
    }
}

// Fixed gameUpdate function for onlinePage.js
// Fixed gameUpdate function for onlinePage.ts
function gameUpdate(data: any, MyUsername: string, gameState: OnlineGameState): void {
    console.log(`\n🎯 GAME UPDATE for ${MyUsername}:`);
    console.log(`  - My paddle side: ${gameState.paddleSide}`);
    console.log(`  - Received data:`, data);

    // Ball update
    gameState.ball.x = data.ball.x;
    gameState.ball.y = data.ball.y;

    // Find opponent username
    const opponentUsername = Object.keys(data.scores).find(username => username !== MyUsername);
    console.log(`  - Opponent username: ${opponentUsername}`);

    // CRITICAL FIX: Add validation checks before updating paddles
    if (!data.paddles || !data.paddles.left || !data.paddles.right) {
        console.warn("Invalid paddle data received:", data.paddles);
        return;
    }

    // Store current paddle positions for comparison
    const currentLeftY = gameState.paddles.left.y;
    const currentRightY = gameState.paddles.right.y;

    // FIXED: Only update opponent paddle with additional validation
    if (gameState.paddleSide === 'left') {
        // I control the left paddle, so update ONLY the right (opponent) paddle
        // Only update if the position actually changed to avoid unnecessary updates
        if (data.paddles.right.y !== currentRightY) {
            gameState.paddles.right.y = data.paddles.right.y;
            console.log(`  - Updated RIGHT paddle (opponent): ${currentRightY} → ${data.paddles.right.y}`);
        }
        
        // NEVER update left paddle - that's controlled by my input
        console.log(`  - LEFT paddle (mine) remains at: ${gameState.paddles.left.y}`);
    } else {
        // I control the right paddle, so update ONLY the left (opponent) paddle  
        // Only update if the position actually changed
        if (data.paddles.left.y !== currentLeftY) {
            gameState.paddles.left.y = data.paddles.left.y;
            console.log(`  - Updated LEFT paddle (opponent): ${currentLeftY} → ${data.paddles.left.y}`);
        }
        
        // NEVER update right paddle - that's controlled by my input
        console.log(`  - RIGHT paddle (mine) remains at: ${gameState.paddles.right.y}`);
    }

    // Score update with validation
    if (opponentUsername && data.scores[MyUsername] !== undefined && data.scores[opponentUsername] !== undefined) {
        if (gameState.paddleSide === 'left') {
            gameState.score.left = data.scores[MyUsername];
            gameState.score.right = data.scores[opponentUsername];
        } else {
            gameState.score.right = data.scores[MyUsername];
            gameState.score.left = data.scores[opponentUsername];
        }
        console.log(`  - Updated scores: Left=${gameState.score.left}, Right=${gameState.score.right}`);
    }

    gameState.gameOver = data.gameOver;
}

// Fixed update function with better paddle movement handling
function update(gameState: OnlineGameState): void {
    if (gameState.gameOver) return;

    // Handle player paddle movement (only for the paddle assigned to this player)
    const playerPaddle = gameState.paddles[gameState.paddleSide];
    let paddleMoved = false;
    const oldY = playerPaddle.y;
    
    // Store the intended new position
    let newY = playerPaddle.y;
    
    if ((gameState.keys['w'] || gameState.keys['arrowup']) && playerPaddle.y > 10) {
        newY = playerPaddle.y - playerPaddle.speed;
        paddleMoved = true;
    }
    if ((gameState.keys['s'] || gameState.keys['arrowdown']) && playerPaddle.y < gameState.canvas.height - 10 - playerPaddle.height) {
        newY = playerPaddle.y + playerPaddle.speed;
        paddleMoved = true;
    }

    // Apply bounds checking
    const minY = 10;
    const maxY = gameState.canvas.height - 10 - playerPaddle.height;
    newY = Math.max(minY, Math.min(maxY, newY));

    // Only update if position actually changed
    if (paddleMoved && newY !== oldY) {
        playerPaddle.y = newY;
        
        // Send paddle position to server if it moved and socket is ready
        if (gameState.socket && gameState.socket.readyState === WebSocket.OPEN) {
            console.log(`\n🎮 SENDING PADDLE INPUT:`);
            console.log(`  - My username: ${Myusername1}`);
            console.log(`  - My paddle side: ${gameState.paddleSide}`);
            console.log(`  - Paddle moved from ${oldY} to ${playerPaddle.y}`);
            
            gameState.socket.send(JSON.stringify({
                type: 'player_input',
                data: {
					matchId: gameState.gameId,
                    y: playerPaddle.y,
                    username: Myusername1,
                }
            }));
        }
    }

    // Update score display
    const leftScore = document.getElementById('left-score');
    const rightScore = document.getElementById('right-score');
    if (leftScore) leftScore.textContent = gameState.score.left.toString();
    if (rightScore) rightScore.textContent = gameState.score.right.toString();
}

// Additional fix: Add throttling to prevent too many updates
let lastPaddleUpdate = 0;
const PADDLE_UPDATE_THROTTLE = 16; // ~60fps

function throttledUpdate(gameState: OnlineGameState): void {
    const now = Date.now();
    if (now - lastPaddleUpdate < PADDLE_UPDATE_THROTTLE) {
        return;
    }
    lastPaddleUpdate = now;
    update(gameState);
}


async function loadTheme() {
    try { 
        const theme = await getTheme();
        if (theme) {
            MatchBall = theme.MatchBall;
            PaddleColor = theme.PaddleColor;
        }
    }
    catch (error) {
        console.error("Error loading theme:", error);
    }
}

loadTheme();

let Myusername1 : string = '';

export function renderOnlinePage(gameId: string, paddleSide: 'left' | 'right', opponentUsername: string, Myusername: string): void {
    const app = document.getElementById("main-page");
    if (!app) return;

	Myusername1 = Myusername;
	opponentUsername = opponentUsername
    // Determine display labels based on paddle assignment
    const isLeftPaddle = paddleSide === 'left';
    const playerLabel = isLeftPaddle ? 'You' : 'You';
    const opponentLabel = isLeftPaddle ? opponentUsername : opponentUsername ;
	
	

	app.innerHTML = `
    <div class="animation-backround">
        <div id="countdown" class="countdown">3</div>
        <div class="pong-container">
        <div class="scoreboard">
            <div class="game-score left">
                <span class="player-name">${isLeftPaddle ? playerLabel : opponentLabel}</span>
                <span class="score-value right" id="left-score">0</span>
            </div>
            <div class="game-logo">
                <img src="/assets/logo.png" alt="logo" class="logo-icon" />
            </div>
            <div class="game-score right">
                <span class="score-value left" id="right-score">0</span>
                <span class="player-name">${isLeftPaddle ? opponentLabel : playerLabel}</span>
            </div>
        </div>
            <canvas id="pong-canvas" width="2000" height="1000"></canvas>
            <div class="controls-info">
                <div>Controls: W/S or ↑/↓</div>
                <div class="game-info">Game ID: ${gameId} | Playing as: ${paddleSide.toUpperCase()} paddle</div>
            </div>

            <div id="game-over-modal" class="game-over-modal hidden">
                <div class="modal-content">
                    <h2 id="winner-text">You Win!</h2>
                    <div class="modal-buttons">
                        <button id="home-btn" class="confirm-btn">Home</button>
                    </div>
                </div>
            </div>
            
            <div id="connection-status" class="connection-status">
                <span>Connected</span>
            </div>
        </div>
    </div>
`;

    startCountdown();

    // Initialize the game after countdown
    setTimeout(() => {
        initOnlinePongGame(gameId, paddleSide);
    }, 3000);
}

interface OnlineGameState {
    gameId: string;
    paddleSide: 'left' | 'right';
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
        left: number;
        right: number;
    };
    keys: { [key: string]: boolean };
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    gameRunning: boolean;
    gameOver: boolean;
    winner: string;
    socket: WebSocket | null;
}

function preventPageRefresh(gameState: OnlineGameState) {
    // Prevent refresh/reload during active game
    window.addEventListener('beforeunload', (event) => {
        if (gameState.gameRunning && !gameState.gameOver) {
            // Prevent the page from refreshing
            event.preventDefault();
            event.returnValue = ''; // This is required for some browsers
            return ''; // This is required for some browsers
        }
    });
    
    // Prevent F5 key refresh
    document.addEventListener('keydown', (event) => {
        if (gameState.gameRunning && !gameState.gameOver) {
            // F5 or Ctrl+R
            if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
                event.preventDefault();
                return false;
            }
            // Ctrl+Shift+R (hard refresh)
            if (event.ctrlKey && event.shiftKey && event.key === 'R') {
                event.preventDefault();
                return false;
            }
        }
    });
}

function initOnlinePongGame(gameId: string, paddleSide: 'left' | 'right'): void {
    const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    
    if (!canvas || !ctx) {
        console.error('Canvas not found or context not available');
        return;
    }
    
	

    // Create ball image
    const ballImage = new Image();
    ballImage.src = MatchBall; // Use the loaded MatchBall image
    
    const gameState: OnlineGameState = {
        gameId,
        paddleSide,
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
                speed: 8
            },
            right: {
                x: canvas.width - 50,
                y: canvas.height / 2 - 50,
                width: 25,
                height: 100,
                speed: 8
            }
        },
        score: {
            left: 0,
            right: 0
        },
        keys: {},
        canvas,
        ctx,
        gameRunning: true,
        gameOver: false,
        winner: '',
        socket: socket // Use the imported socket
    };

	gameState.socket.send(JSON.stringify({"type" : "match_ready", "data" : {"username" : Myusername1}}));

    // Set the current game state so handleGameSocket can access it
    currentGameState = gameState;


    // preventPageRefresh(gameState);
    
    // Event listeners for player controls
    document.addEventListener('keydown', (e) => {
        gameState.keys[e.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (e) => {
        gameState.keys[e.key.toLowerCase()] = false;
    });

    // Game over modal event listeners
    document.getElementById('home-btn')?.addEventListener('click', () => {
        currentGameState = null; // Clear the reference
        if (gameState.socket) {
            gameState.socket.close();
        }
        window.location.href = '/';
    });


    // Game loop
    function gameLoop(): void {
        if (!gameState.gameRunning) return;

        update(gameState);
        render(gameState);
        requestAnimationFrame(gameLoop);
    }

    // Start the game when ball image loads
    ballImage.onload = () => {
        gameLoop();
    };
}



function render(gameState: OnlineGameState): void {
    const ctx = gameState.ctx;
    const canvas = gameState.canvas;

    // Clear canvas
    ctx.fillStyle = '#9EB9FE';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Draw paddles with different colors based on ownership
    const leftPaddle = gameState.paddles.left;
    const rightPaddle = gameState.paddles.right;
    
    // Player paddle (brighter color)
    ctx.fillStyle = PaddleColor; // Use the theme color for player paddle
    const playerPaddle = gameState.paddleSide === 'left' ? leftPaddle : rightPaddle;
    ctx.beginPath();
    ctx.roundRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, 10);
    ctx.fill();

    // Opponent paddle (normal color)
    ctx.fillStyle = PaddleColor; // Use the theme color for opponent paddle
    const opponentPaddle = gameState.paddleSide === 'left' ? rightPaddle : leftPaddle;
    ctx.beginPath();
    ctx.roundRect(opponentPaddle.x, opponentPaddle.y, opponentPaddle.width, opponentPaddle.height, 10);
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
            countdownEl.style.display = 'none';
        }
    }, 1000);
}
