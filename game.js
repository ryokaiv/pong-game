// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballSize,
    dx: 5,
    dy: 5,
    speed: 5,
    maxSpeed: 8
};

// Game state
let playerScore = 0;
let computerScore = 0;
let isPaused = false;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === ' ') {
        e.preventDefault();
        isPaused = !isPaused;
    }

    if (e.key.toLowerCase() === 'r') {
        resetGame();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update player paddle
function updatePlayer() {
    // Mouse control
    player.y = Math.max(0, Math.min(mouseY - paddleHeight / 2, canvas.height - paddleHeight));

    // Arrow key control (overrides mouse if used)
    if (keys['ArrowUp']) {
        player.y = Math.max(0, player.y - player.speed);
    }
    if (keys['ArrowDown']) {
        player.y = Math.min(canvas.height - paddleHeight, player.y + player.speed);
    }
}

// Update computer paddle (AI)
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;

    if (computerCenter < ballCenter - 35) {
        computer.y = Math.min(canvas.height - computer.height, computer.y + computer.speed);
    } else if (computerCenter > ballCenter + 35) {
        computer.y = Math.max(0, computer.y - computer.speed);
    }
}

// Update ball
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top and bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Paddle collision
    const ballRect = { x: ball.x - ball.radius, y: ball.y - ball.radius, width: ball.radius * 2, height: ball.radius * 2 };

    // Player paddle collision
    if (checkCollision(ballRect, player)) {
        ball.dx = Math.abs(ball.dx);
        ball.x = player.x + player.width + ball.radius;

        // Add spin based on where ball hits paddle
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        const angleRad = (Math.PI / 4) * collidePoint;

        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = speed * Math.cos(angleRad);
        ball.dy = speed * Math.sin(angleRad);
    }

    // Computer paddle collision
    if (checkCollision(ballRect, computer)) {
        ball.dx = -Math.abs(ball.dx);
        ball.x = computer.x - ball.radius;

        // Add spin based on where ball hits paddle
        let collidePoint = ball.y - (computer.y + computer.height / 2);
        const normalizedCollide = collidePoint / (computer.height / 2);
        const angleRad = (Math.PI / 4) * normalizedCollide;

        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = -speed * Math.cos(angleRad);
        ball.dy = speed * Math.sin(angleRad);
    }

    // Scoring
    if (ball.x - ball.radius < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }
}

// Reset ball position
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 5;
}

// Reset entire game
function resetGame() {
    playerScore = 0;
    computerScore = 0;
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
    resetBall();
    player.y = canvas.height / 2 - paddleHeight / 2;
    computer.y = canvas.height / 2 - paddleHeight / 2;
    isPaused = false;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#4ecca3';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'rgba(78, 204, 163, 0.5)';
    ctx.shadowBlur = 10;
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 10;
}

function drawCenter() {
    ctx.strokeStyle = 'rgba(78, 204, 163, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawPauseText() {
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4ecca3';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Press SPACE to resume', canvas.width / 2, canvas.height / 2 + 50);
    }
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = 'rgba(20, 20, 40, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenter();

    if (!isPaused) {
        updatePlayer();
        updateComputer();
        updateBall();
    }

    // Draw game elements
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
    drawPauseText();

    // Reset shadow
    ctx.shadowColor = 'transparent';

    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();