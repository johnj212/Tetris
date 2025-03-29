// Import the Tetris game code
const { TetrisGame, GRID_WIDTH, GRID_HEIGHT } = require('../static/js/tetris.js');

// Test suite for Tetris game
describe('Tetris Game Tests', () => {
    let game;
    let canvas;
    let nextCanvas;
    let heldCanvas;

    beforeEach(() => {
        // Create mock canvas elements
        canvas = document.createElement('canvas');
        nextCanvas = document.createElement('canvas');
        heldCanvas = document.createElement('canvas');
        
        // Mock document.getElementById
        document.getElementById = jest.fn((id) => {
            switch(id) {
                case 'gameCanvas': return canvas;
                case 'nextPieceCanvas': return nextCanvas;
                case 'heldPieceCanvas': return heldCanvas;
                case 'score': return { textContent: '' };
                case 'level': return { textContent: '' };
                case 'final-score': return { textContent: '' };
                case 'game-over': return { classList: { add: jest.fn(), remove: jest.fn() } };
                case 'pause-overlay': return { classList: { add: jest.fn(), remove: jest.fn() } };
                default: return null;
            }
        });

        // Create game instance
        game = new TetrisGame();
    });

    // Test game initialization
    test('Game initializes correctly', () => {
        expect(game.grid.length).toBe(GRID_HEIGHT);
        expect(game.grid[0].length).toBe(GRID_WIDTH);
        expect(game.score).toBe(0);
        expect(game.level).toBe(1);
        expect(game.gameOver).toBe(false);
        expect(game.paused).toBe(false);
        expect(game.currentPiece).toBeDefined();
        expect(game.nextPiece).toBeDefined();
    });

    // Test piece movement
    test('Piece moves correctly', () => {
        const initialX = game.currentPiece.x;
        const initialY = game.currentPiece.y;

        // Test left movement
        game.movePiece(-1, 0);
        expect(game.currentPiece.x).toBe(initialX - 1);

        // Test right movement
        game.movePiece(1, 0);
        expect(game.currentPiece.x).toBe(initialX);

        // Test downward movement
        game.movePiece(0, 1);
        expect(game.currentPiece.y).toBe(initialY + 1);
    });

    // Test piece rotation
    test('Piece rotates correctly', () => {
        const originalShape = JSON.parse(JSON.stringify(game.currentPiece.shape));
        game.rotatePiece();
        expect(JSON.stringify(game.currentPiece.shape)).not.toBe(JSON.stringify(originalShape));
    });

    // Test piece placement
    test('Piece places correctly', () => {
        const pieceColor = game.currentPiece.color;
        const pieceShape = game.currentPiece.shape;
        const pieceX = game.currentPiece.x;
        const pieceY = game.currentPiece.y;

        game.placePiece();

        // Check if piece is placed in grid
        for (let r = 0; r < pieceShape.length; r++) {
            for (let c = 0; c < pieceShape[r].length; c++) {
                if (pieceShape[r][c]) {
                    expect(game.grid[pieceY + r][pieceX + c]).toBe(pieceColor);
                }
            }
        }
    });

    // Test line clearing
    test('Lines clear correctly', () => {
        // Fill a row
        for (let c = 0; c < GRID_WIDTH; c++) {
            game.grid[GRID_HEIGHT - 1][c] = '#FF0000';
        }

        const initialScore = game.score;
        game.clearLines();

        // Check if row is cleared
        expect(game.grid[GRID_HEIGHT - 1].every(cell => cell === 0)).toBe(true);
        expect(game.score).toBeGreaterThan(initialScore);
    });

    // Test game over condition
    test('Game over triggers correctly', () => {
        // Fill top row
        for (let c = 0; c < GRID_WIDTH; c++) {
            game.grid[0][c] = '#FF0000';
        }

        game.update();
        expect(game.gameOver).toBe(true);
    });

    // Test hold piece functionality
    test('Hold piece works correctly', () => {
        const initialPiece = JSON.parse(JSON.stringify(game.currentPiece));
        game.holdPiece();
        expect(game.heldPiece).toBeDefined();
        expect(JSON.stringify(game.heldPiece.shape)).toBe(JSON.stringify(initialPiece.shape));
        expect(game.canHold).toBe(false);
    });

    // Test pause functionality
    test('Pause works correctly', () => {
        game.togglePause();
        expect(game.paused).toBe(true);
        game.togglePause();
        expect(game.paused).toBe(false);
    });

    // Test restart functionality
    test('Game restarts correctly', () => {
        // Set up some game state
        game.score = 100;
        game.level = 2;
        game.grid[0][0] = '#FF0000';
        game.gameOver = true;

        game.restart();
        expect(game.score).toBe(0);
        expect(game.level).toBe(1);
        expect(game.grid[0][0]).toBe(0);
        expect(game.gameOver).toBe(false);
    });

    // Test score calculation
    test('Score updates correctly', () => {
        const initialScore = game.score;
        // Clear 10 lines to reach level 2
        for (let i = 0; i < 10; i++) {
            game.updateScore(1);
        }
        expect(game.score).toBeGreaterThan(initialScore);
        expect(game.level).toBeGreaterThan(1);
    });
}); 