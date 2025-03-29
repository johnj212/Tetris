import pygame
import random
from typing import List, Tuple, Optional
import os

# Initialize Pygame and Pygame mixer
pygame.init()
pygame.mixer.init()

# Constants
BLOCK_SIZE = 30
GRID_WIDTH = 10
GRID_HEIGHT = 20
SCREEN_WIDTH = BLOCK_SIZE * (GRID_WIDTH + 8)  # Extra space for UI
SCREEN_HEIGHT = BLOCK_SIZE * GRID_HEIGHT

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GRAY = (128, 128, 128)
COLORS = [
    (0, 255, 255),  # Cyan
    (255, 255, 0),  # Yellow
    (255, 165, 0),  # Orange
    (0, 0, 255),    # Blue
    (0, 255, 0),    # Green
    (255, 0, 0),    # Red
    (255, 0, 255),  # Purple
]

# Tetromino shapes
SHAPES = [
    [[1, 1, 1, 1]],  # I
    [[1, 1], [1, 1]],  # O
    [[1, 1, 1], [0, 1, 0]],  # T
    [[1, 1, 1], [1, 0, 0]],  # L
    [[1, 1, 1], [0, 0, 1]],  # J
    [[1, 1, 0], [0, 1, 1]],  # S
    [[0, 1, 1], [1, 1, 0]],  # Z
]

# Sound effects
class SoundManager:
    def __init__(self):
        self.sounds = {}
        self.music = None
        self.load_sounds()

    def load_sounds(self):
        # Load sound effects
        self.sounds['move'] = pygame.mixer.Sound('audio/move.wav')
        self.sounds['rotate'] = pygame.mixer.Sound('audio/rotate.wav')
        self.sounds['drop'] = pygame.mixer.Sound('audio/drop.wav')
        self.sounds['clear'] = pygame.mixer.Sound('audio/clear.wav')
        self.sounds['gameover'] = pygame.mixer.Sound('audio/gameover.wav')
        
        # Load and start background music
        pygame.mixer.music.load('audio/tetris_theme.mp3')
        pygame.mixer.music.set_volume(0.5)
        pygame.mixer.music.play(-1)  # -1 means loop indefinitely

    def play_sound(self, sound_name: str):
        if sound_name in self.sounds:
            self.sounds[sound_name].play()

    def stop_music(self):
        pygame.mixer.music.stop()

    def resume_music(self):
        pygame.mixer.music.play(-1)

class Tetris:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Tetris")
        self.clock = pygame.time.Clock()
        self.sound_manager = SoundManager()
        self.reset_game()

    def reset_game(self):
        self.grid = [[0 for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
        self.current_piece = self.new_piece()
        self.next_piece = self.new_piece()
        self.held_piece = None
        self.can_hold = True
        self.score = 0
        self.level = 1
        self.lines_cleared = 0
        self.game_over = False
        self.fall_time = 0
        self.fall_speed = 1000  # Initial fall speed in milliseconds
        self.sound_manager.resume_music()

    def new_piece(self) -> dict:
        shape_idx = random.randint(0, len(SHAPES) - 1)
        return {
            'shape': SHAPES[shape_idx],
            'color': COLORS[shape_idx],
            'x': GRID_WIDTH // 2 - len(SHAPES[shape_idx][0]) // 2,
            'y': 0
        }

    def rotate_piece(self, piece: dict) -> dict:
        rows = len(piece['shape'])
        cols = len(piece['shape'][0])
        rotated = [[0 for _ in range(rows)] for _ in range(cols)]
        
        for r in range(rows):
            for c in range(cols):
                rotated[c][rows-1-r] = piece['shape'][r][c]
        
        return {'shape': rotated, 'color': piece['color'], 'x': piece['x'], 'y': piece['y']}

    def valid_move(self, piece: dict, x: int, y: int) -> bool:
        for i, row in enumerate(piece['shape']):
            for j, cell in enumerate(row):
                if cell:
                    new_x = x + j
                    new_y = y + i
                    if (new_x < 0 or new_x >= GRID_WIDTH or 
                        new_y >= GRID_HEIGHT or 
                        (new_y >= 0 and self.grid[new_y][new_x])):
                        return False
        return True

    def place_piece(self, piece: dict):
        for i, row in enumerate(piece['shape']):
            for j, cell in enumerate(row):
                if cell:
                    self.grid[piece['y'] + i][piece['x'] + j] = piece['color']
        
        lines_cleared = self.clear_lines()
        self.update_score(lines_cleared)
        
        self.current_piece = self.next_piece
        self.next_piece = self.new_piece()
        
        if not self.valid_move(self.current_piece, self.current_piece['x'], self.current_piece['y']):
            self.game_over = True
            self.sound_manager.play_sound('gameover')
            self.sound_manager.stop_music()

    def clear_lines(self) -> int:
        lines_cleared = 0
        for i in range(GRID_HEIGHT):
            if all(self.grid[i]):
                del self.grid[i]
                self.grid.insert(0, [0 for _ in range(GRID_WIDTH)])
                lines_cleared += 1
                self.sound_manager.play_sound('clear')
        return lines_cleared

    def update_score(self, lines_cleared: int):
        if lines_cleared > 0:
            self.lines_cleared += lines_cleared
            self.score += [0, 100, 300, 500, 800][lines_cleared] * self.level
            self.level = self.lines_cleared // 10 + 1
            self.fall_speed = max(100, 1000 - (self.level - 1) * 100)

    def get_ghost_piece(self) -> dict:
        ghost = self.current_piece.copy()
        while self.valid_move(ghost, ghost['x'], ghost['y'] + 1):
            ghost['y'] += 1
        return ghost

    def draw(self):
        self.screen.fill(BLACK)
        
        # Draw grid
        for y, row in enumerate(self.grid):
            for x, color in enumerate(row):
                if color:
                    pygame.draw.rect(self.screen, color,
                                   (x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1))

        # Draw current piece
        if not self.game_over:
            for i, row in enumerate(self.current_piece['shape']):
                for j, cell in enumerate(row):
                    if cell:
                        pygame.draw.rect(self.screen, self.current_piece['color'],
                                       ((self.current_piece['x'] + j) * BLOCK_SIZE,
                                        (self.current_piece['y'] + i) * BLOCK_SIZE,
                                        BLOCK_SIZE - 1, BLOCK_SIZE - 1))

        # Draw ghost piece
        ghost = self.get_ghost_piece()
        for i, row in enumerate(ghost['shape']):
            for j, cell in enumerate(row):
                if cell:
                    pygame.draw.rect(self.screen, (*ghost['color'][:3], 128),
                                   ((ghost['x'] + j) * BLOCK_SIZE,
                                    (ghost['y'] + i) * BLOCK_SIZE,
                                    BLOCK_SIZE - 1, BLOCK_SIZE - 1))

        # Draw next piece preview
        next_x = GRID_WIDTH * BLOCK_SIZE + 50
        next_y = 50
        pygame.draw.rect(self.screen, WHITE, (next_x, next_y, 5 * BLOCK_SIZE, 5 * BLOCK_SIZE), 1)
        for i, row in enumerate(self.next_piece['shape']):
            for j, cell in enumerate(row):
                if cell:
                    pygame.draw.rect(self.screen, self.next_piece['color'],
                                   (next_x + j * BLOCK_SIZE + BLOCK_SIZE,
                                    next_y + i * BLOCK_SIZE + BLOCK_SIZE,
                                    BLOCK_SIZE - 1, BLOCK_SIZE - 1))

        # Draw held piece
        if self.held_piece:
            hold_x = GRID_WIDTH * BLOCK_SIZE + 50
            hold_y = 200
            pygame.draw.rect(self.screen, WHITE, (hold_x, hold_y, 5 * BLOCK_SIZE, 5 * BLOCK_SIZE), 1)
            for i, row in enumerate(self.held_piece['shape']):
                for j, cell in enumerate(row):
                    if cell:
                        pygame.draw.rect(self.screen, self.held_piece['color'],
                                       (hold_x + j * BLOCK_SIZE + BLOCK_SIZE,
                                        hold_y + i * BLOCK_SIZE + BLOCK_SIZE,
                                        BLOCK_SIZE - 1, BLOCK_SIZE - 1))

        # Draw score and level
        font = pygame.font.Font(None, 36)
        score_text = font.render(f'Score: {self.score}', True, WHITE)
        level_text = font.render(f'Level: {self.level}', True, WHITE)
        self.screen.blit(score_text, (GRID_WIDTH * BLOCK_SIZE + 50, 350))
        self.screen.blit(level_text, (GRID_WIDTH * BLOCK_SIZE + 50, 400))

        if self.game_over:
            game_over_text = font.render('GAME OVER', True, (255, 0, 0))
            self.screen.blit(game_over_text, (SCREEN_WIDTH // 2 - game_over_text.get_width() // 2,
                                            SCREEN_HEIGHT // 2))

        pygame.display.flip()

    def run(self):
        while True:
            current_time = pygame.time.get_ticks()
            
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    return
                
                if event.type == pygame.KEYDOWN and not self.game_over:
                    if event.key == pygame.K_LEFT:
                        if self.valid_move(self.current_piece, self.current_piece['x'] - 1, self.current_piece['y']):
                            self.current_piece['x'] -= 1
                            self.sound_manager.play_sound('move')
                    elif event.key == pygame.K_RIGHT:
                        if self.valid_move(self.current_piece, self.current_piece['x'] + 1, self.current_piece['y']):
                            self.current_piece['x'] += 1
                            self.sound_manager.play_sound('move')
                    elif event.key == pygame.K_DOWN:
                        if self.valid_move(self.current_piece, self.current_piece['x'], self.current_piece['y'] + 1):
                            self.current_piece['y'] += 1
                            self.sound_manager.play_sound('move')
                    elif event.key == pygame.K_UP:
                        rotated = self.rotate_piece(self.current_piece)
                        if self.valid_move(rotated, rotated['x'], rotated['y']):
                            self.current_piece = rotated
                            self.sound_manager.play_sound('rotate')
                    elif event.key == pygame.K_SPACE:
                        while self.valid_move(self.current_piece, self.current_piece['x'], self.current_piece['y'] + 1):
                            self.current_piece['y'] += 1
                        self.place_piece(self.current_piece)
                        self.sound_manager.play_sound('drop')
                    elif event.key == pygame.K_c:
                        if self.can_hold:
                            if self.held_piece:
                                self.current_piece, self.held_piece = self.held_piece, self.current_piece
                                self.current_piece['x'] = GRID_WIDTH // 2 - len(self.current_piece['shape'][0]) // 2
                                self.current_piece['y'] = 0
                            else:
                                self.held_piece = self.current_piece
                                self.current_piece = self.next_piece
                                self.next_piece = self.new_piece()
                            self.can_hold = False
                            self.sound_manager.play_sound('move')
                elif event.type == pygame.KEYDOWN and self.game_over:
                    if event.key == pygame.K_r:
                        self.reset_game()

            if not self.game_over:
                if current_time - self.fall_time > self.fall_speed:
                    if self.valid_move(self.current_piece, self.current_piece['x'], self.current_piece['y'] + 1):
                        self.current_piece['y'] += 1
                    else:
                        self.place_piece(self.current_piece)
                        self.can_hold = True
                        self.sound_manager.play_sound('drop')
                    self.fall_time = current_time

            self.draw()
            self.clock.tick(60)

if __name__ == '__main__':
    game = Tetris()
    game.run() 