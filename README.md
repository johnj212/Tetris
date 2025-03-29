# Python Tetris Game

A modern implementation of the classic Tetris game using Python and Pygame.

## Features

- Classic Tetris gameplay
- Score tracking
- Level system with increasing speed
- Next piece preview
- Hold piece functionality
- Ghost piece (shows where the piece will land)
- Modern UI elements
- Game over screen with restart option

## Requirements

- Python 3.6 or higher
- Pygame 2.5.2

## Installation

1. Clone this repository or download the files
2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

## How to Play

Run the game:
```bash
python tetris.py
```

### Controls

- **Left Arrow**: Move piece left
- **Right Arrow**: Move piece right
- **Down Arrow**: Move piece down faster
- **Up Arrow**: Rotate piece
- **Space**: Hard drop (instantly drop piece)
- **C**: Hold piece
- **R**: Restart game (when game is over)

### Scoring System

- 1 line: 100 points × level
- 2 lines: 300 points × level
- 3 lines: 500 points × level
- 4 lines: 800 points × level

The game speed increases as you level up. Each level is reached by clearing 10 lines. 