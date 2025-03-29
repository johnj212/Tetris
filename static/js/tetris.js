// Constants
const BLOCK_SIZE = 30;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;

// Colors
const COLORS = [
    '#00FFFF', // Cyan
    '#FFFF00', // Yellow
    '#FFA500', // Orange
    '#0000FF', // Blue
    '#00FF00', // Green
    '#FF0000', // Red
    '#FF00FF'  // Purple
];

// Tetromino shapes
const SHAPES = [
    [[1, 1, 1, 1]],  // I
    [[1, 1], [1, 1]],  // O
    [[1, 1, 1], [0, 1, 0]],  // T
    [[1, 1, 1], [1, 0, 0]],  // L
    [[1, 1, 1], [0, 0, 1]],  // J
    [[1, 1, 0], [0, 1, 1]],  // S
    [[0, 1, 1], [1, 1, 0]]   // Z
];

class TetrisGame {
    constructor() {
        this.initCanvas();
        this.initGame();
        this.initControls();
        this.initAudio();
        this.startGameLoop();
    }

    initCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPieceCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.heldCanvas = document.getElementById('heldPieceCanvas');
        this.heldCtx = this.heldCanvas.getContext('2d');

        // Set canvas sizes
        this.canvas.width = BLOCK_SIZE * GRID_WIDTH;
        this.canvas.height = BLOCK_SIZE * GRID_HEIGHT;
        this.nextCanvas.width = BLOCK_SIZE * 4;
        this.nextCanvas.height = BLOCK_SIZE * 4;
        this.heldCanvas.width = BLOCK_SIZE * 4;
        this.heldCanvas.height = BLOCK_SIZE * 4;
    }

    initGame() {
        this.grid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0));
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.gameOver = false;
        this.paused = false;
        this.currentPiece = this.newPiece();
        this.nextPiece = this.newPiece();
        this.heldPiece = null;
        this.canHold = true;
        this.dropInterval = 1000;
        this.lastDrop = Date.now();
    }

    initControls() {
        // Add keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    break;
                case ' ':
                    this.hardDrop();
                    break;
                case 'c':
                case 'C':
                    this.holdPiece();
                    break;
                case 'p':
                case 'P':
                    this.togglePause();
                    break;
            }
        });

        // Add touch controls
        const addButtonEvents = (buttonId, action) => {
            const button = document.getElementById(buttonId);
            if (!button) return;

            const handleEvent = (e) => {
                e.preventDefault();
                if (buttonId === 'restart-btn' || !this.gameOver) {
                    action();
                }
            };

            button.addEventListener('click', handleEvent);
            button.addEventListener('touchstart', handleEvent);
        };

        addButtonEvents('left-btn', () => this.movePiece(-1, 0));
        addButtonEvents('right-btn', () => this.movePiece(1, 0));
        addButtonEvents('down-btn', () => this.movePiece(0, 1));
        addButtonEvents('rotate-btn', () => this.rotatePiece());
        addButtonEvents('drop-btn', () => this.hardDrop());
        addButtonEvents('hold-btn', () => this.holdPiece());
        addButtonEvents('pause-btn', () => this.togglePause());
        addButtonEvents('unpause-btn', () => this.togglePause());
        addButtonEvents('restart-btn', () => this.restart());
    }

    initAudio() {
        this.bgMusic = new Audio('/audio/tetris_theme.mp3');
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.5;

        this.clearSound = new Audio('/audio/clear.wav');
        this.clearSound.volume = 0.3;

        this.dropSound = new Audio('/audio/drop.wav');
        this.dropSound.volume = 0.3;

        this.gameOverSound = new Audio('/audio/gameover.wav');
        this.gameOverSound.volume = 0.3;

        this.holdSound = new Audio('/audio/move.wav');
        this.holdSound.volume = 0.3;

        this.rotateSound = new Audio('/audio/rotate.wav');
        this.rotateSound.volume = 0.3;
    }

    newPiece() {
        const shapeIdx = Math.floor(Math.random() * SHAPES.length);
        return {
            shape: SHAPES[shapeIdx],
            color: COLORS[shapeIdx],
            x: Math.floor(GRID_WIDTH / 2) - Math.floor(SHAPES[shapeIdx][0].length / 2),
            y: 0
        };
    }

    movePiece(dx, dy) {
        if (this.isValidMove(this.currentPiece.x + dx, this.currentPiece.y + dy, this.currentPiece.shape)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            if (dx !== 0 || dy !== 0) this.rotateSound.play();
            return true;
        }
        return false;
    }

    rotatePiece() {
        const rotated = this.rotate(this.currentPiece.shape);
        if (this.isValidMove(this.currentPiece.x, this.currentPiece.y, rotated)) {
            this.currentPiece.shape = rotated;
            this.rotateSound.play();
        }
    }

    rotate(shape) {
        const rows = shape.length;
        const cols = shape[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                rotated[c][rows - 1 - r] = shape[r][c];
            }
        }
        
        return rotated;
    }

    isValidMove(x, y, shape) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const newX = x + c;
                    const newY = y + r;
                    if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT ||
                        (newY >= 0 && this.grid[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    hardDrop() {
        while (this.movePiece(0, 1)) {}
        this.placePiece();
    }

    holdPiece() {
        if (!this.canHold) return;
        
        const temp = this.currentPiece;
        if (this.heldPiece === null) {
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.newPiece();
        } else {
            this.currentPiece = {
                shape: this.heldPiece.shape,
                color: this.heldPiece.color,
                x: Math.floor(GRID_WIDTH / 2) - Math.floor(this.heldPiece.shape[0].length / 2),
                y: 0
            };
        }
        this.heldPiece = {
            shape: temp.shape,
            color: temp.color
        };
        this.canHold = false;
        this.holdSound.play();
    }

    placePiece() {
        for (let r = 0; r < this.currentPiece.shape.length; r++) {
            for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
                if (this.currentPiece.shape[r][c]) {
                    if (this.currentPiece.y + r < 0) {
                        this.gameOver = true;
                        this.gameOverSound.play();
                        this.bgMusic.pause();
                        document.getElementById('game-over').classList.remove('hidden');
                        document.getElementById('final-score').textContent = this.score;
                        return;
                    }
                    this.grid[this.currentPiece.y + r][this.currentPiece.x + c] = this.currentPiece.color;
                }
            }
        }

        this.dropSound.play();
        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.newPiece();
        this.canHold = true;
    }

    clearLines() {
        let linesCleared = 0;
        for (let r = GRID_HEIGHT - 1; r >= 0; r--) {
            if (this.grid[r].every(cell => cell !== 0)) {
                this.grid.splice(r, 1);
                this.grid.unshift(Array(GRID_WIDTH).fill(0));
                linesCleared++;
                r++;
            }
        }
        
        if (linesCleared > 0) {
            this.clearSound.play();
            this.updateScore(linesCleared);
        }
    }

    updateScore(linesCleared) {
        const points = [0, 100, 300, 500, 800];
        this.score += points[linesCleared] * this.level;
        this.linesCleared += linesCleared;
        this.level = Math.floor(this.linesCleared / 10) + 1;
        this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('level').textContent = `Level: ${this.level}`;
    }

    drawBlock(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
    }

    drawPiece(ctx, piece, offsetX = 0, offsetY = 0) {
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    this.drawBlock(ctx, piece.x + c + offsetX, piece.y + r + offsetY, piece.color);
                }
            }
        }
    }

    drawPreview(ctx, piece, size) {
        ctx.clearRect(0, 0, size * BLOCK_SIZE, size * BLOCK_SIZE);
        const offsetX = Math.floor((size - piece.shape[0].length) / 2);
        const offsetY = Math.floor((size - piece.shape.length) / 2);
        
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    this.drawBlock(ctx, offsetX + c, offsetY + r, piece.color);
                }
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        for (let r = 0; r < GRID_HEIGHT; r++) {
            for (let c = 0; c < GRID_WIDTH; c++) {
                if (this.grid[r][c]) {
                    this.drawBlock(this.ctx, c, r, this.grid[r][c]);
                }
            }
        }

        // Draw current piece
        if (!this.gameOver && !this.paused) {
            this.drawPiece(this.ctx, this.currentPiece);
        }

        // Draw next piece preview
        this.drawPreview(this.nextCtx, this.nextPiece, 4);

        // Draw held piece
        if (this.heldPiece) {
            this.drawPreview(this.heldCtx, this.heldPiece, 4);
        } else {
            this.heldCtx.clearRect(0, 0, this.heldCanvas.width, this.heldCanvas.height);
        }
    }

    togglePause() {
        this.paused = !this.paused;
        const pauseOverlay = document.getElementById('pause-overlay');
        
        if (this.paused) {
            pauseOverlay.classList.remove('hidden');
            this.gameLoop = null;
        } else {
            pauseOverlay.classList.add('hidden');
            this.startGameLoop();
        }
    }

    restart() {
        // Reset game state
        this.initGame();
        
        // Reset UI
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('pause-overlay').classList.add('hidden');
        
        // Reset audio
        this.bgMusic.currentTime = 0;
        this.bgMusic.play();
        
        // Reset game loop
        this.lastDrop = Date.now();
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        
        // Force a redraw
        this.draw();
        
        // Start new game loop
        this.startGameLoop();
    }

    startGameLoop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        
        this.gameLoop = () => {
            this.update();
            this.draw();
            if (!this.gameOver && !this.paused) {
                requestAnimationFrame(this.gameLoop);
            }
        };
        this.gameLoop();
    }

    update() {
        if (!this.gameOver && !this.paused) {
            const now = Date.now();
            if (now - this.lastDrop > this.dropInterval) {
                if (!this.movePiece(0, 1)) {
                    this.placePiece();
                }
                this.lastDrop = now;
            }

            // Check for game over condition
            for (let c = 0; c < GRID_WIDTH; c++) {
                if (this.grid[0][c] !== 0) {
                    this.gameOver = true;
                    this.gameOverSound.play();
                    this.bgMusic.pause();
                    document.getElementById('game-over').classList.remove('hidden');
                    document.getElementById('final-score').textContent = this.score;
                    return;
                }
            }
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new TetrisGame();
}); 