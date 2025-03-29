# Web Tetris Game

A modern web-based implementation of the classic Tetris game, optimized for mobile devices.

## Features

- Classic Tetris gameplay
- Mobile-optimized touch controls
- Score tracking
- Level system with increasing speed
- Next piece preview
- Hold piece functionality
- Star Wars Cantina Band background music and sound effects
- Pause functionality
- Responsive design for both portrait and landscape orientations
- Works on iPhone and other mobile browsers

## Requirements

- Python 3.6 or higher
- Flask 3.0.2
- Modern web browser with JavaScript enabled

## Installation

1. Clone this repository or download the files
2. Install the required dependencies:
```bash
pip install -r requirements.txt
```
## How to Play

Start the server:
```bash
python app.py
```

Then open your browser and navigate to:
- Local: `http://localhost:5000`
- Mobile: `http://<your-computer-ip>:5000`

### Controls

#### Touch Controls (Mobile)
- **Left/Right/Down Buttons**: Move piece
- **Rotate Button**: Rotate piece
- **Drop Button**: Hard drop (instantly drop piece)
- **Hold Button**: Hold current piece
- **Pause Button**: Pause/Unpause game

#### Keyboard Controls (Desktop)
- **Left/Right/Down Arrows**: Move piece
- **Up Arrow**: Rotate piece
- **Space**: Hard drop (instantly drop piece)
- **C**: Hold piece
- **P**: Pause/Unpause game
- **R**: Restart game (when game is over)

### Sound Effects

The game includes the following sound effects:
- Move sound when moving pieces
- Rotation sound when rotating pieces
- Drop sound when pieces land
- Clear sound when lines are cleared
- Game over sound when the game ends
- Background music (Star Wars Cantina Band theme)

### Scoring System

- 1 line: 100 points × level
- 2 lines: 300 points × level
- 3 lines: 500 points × level
- 4 lines: 800 points × level

The game speed increases as you level up. Each level is reached by clearing 10 lines.

## Mobile Browser Compatibility

The game is optimized for mobile browsers and includes:
- Touch-friendly controls
- Responsive layout that adapts to screen orientation
- Prevention of unwanted scrolling/zooming during gameplay
- Full-screen experience
- Audio support (may require user interaction to start on iOS) 
