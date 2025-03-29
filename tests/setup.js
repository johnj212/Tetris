// Mock canvas context
const mockContext = {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    fillStyle: '',
    getContext: jest.fn(() => mockContext)
};

// Mock canvas element
const mockCanvas = {
    width: 0,
    height: 0,
    getContext: jest.fn(() => mockContext)
};

// Mock document.createElement
document.createElement = jest.fn((tagName) => {
    if (tagName === 'canvas') {
        return mockCanvas;
    }
    return {};
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 0));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock Date.now
Date.now = jest.fn(() => 0); 