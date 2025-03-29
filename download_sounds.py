import os
import urllib.request
import sys

def download_file(url, filename):
    try:
        urllib.request.urlretrieve(url, filename)
        print(f"Downloaded: {filename}")
    except Exception as e:
        print(f"Error downloading {filename}: {e}")
        sys.exit(1)

def main():
    # Create audio directory if it doesn't exist
    if not os.path.exists('audio'):
        os.makedirs('audio')

    # Sound files URLs (using free sound effects from freesound.org)
    sound_files = {
        'move.wav': 'https://freesound.org/data/previews/320/320654_5260872-lq.mp3',
        'rotate.wav': 'https://freesound.org/data/previews/320/320654_5260872-lq.mp3',
        'drop.wav': 'https://freesound.org/data/previews/320/320654_5260872-lq.mp3',
        'clear.wav': 'https://freesound.org/data/previews/320/320654_5260872-lq.mp3',
        'gameover.wav': 'https://freesound.org/data/previews/320/320654_5260872-lq.mp3',
        'tetris_theme.mp3': 'https://freesound.org/data/previews/320/320654_5260872-lq.mp3'
    }

    # Download each sound file
    for filename, url in sound_files.items():
        filepath = os.path.join('audio', filename)
        if not os.path.exists(filepath):
            download_file(url, filepath)
        else:
            print(f"File already exists: {filename}")

if __name__ == '__main__':
    main() 