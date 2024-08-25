const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const spriteWidth = 40;
const spriteHeight = 40;

const spriteImages = {
    'idle': 'static/assets/gif/idel.gif',
    'w': 'static/assets/gif/arrowup.gif',
    's': 'static/assets/gif/arrowdown.gif',
    'a': 'static/assets/gif/arrowleft.gif',
    'd': 'static/assets/gif/arrowright.gif'
};

const player = { x: 50, y: 100, speed: 2 };
const keys = {};

const tileImages = {
    0: 'static/assets/assetes/Grass_11-128x128.png',
    1: 'static/assets/assetes/Grass_18-128x128.png'
};

const spriteImageObjects = {};
let currentSprite = 'idle';
let spriteImage = null;

const tileSize = 50;
const camera = { x: 0, y: 0 };

const map = {};

function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
    });
}

async function loadAssets() {
    // Load sprite images
    const spritePromises = Object.values(spriteImages).map(loadImage);
    const spriteImagesLoaded = await Promise.all(spritePromises);
    Object.keys(spriteImages).forEach((key, index) => {
        spriteImageObjects[key] = spriteImagesLoaded[index];
    });

    // Load tile images
    const tilePromises = Object.values(tileImages).map(loadImage);
    const tileImagesLoaded = await Promise.all(tilePromises);
    Object.keys(tileImages).forEach((key, index) => {
        tileImages[key] = tileImagesLoaded[index];
    });

    // Load the map
    await loadMap('js.json');

    // Set initial sprite
    spriteImage = spriteImageObjects[currentSprite];

    // Start the game loop
    requestAnimationFrame(update);
}

async function loadMap(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.width && data.height && data.tiles) {
            map.width = data.width;
            map.height = data.height;
            map.tiles = data.tiles;
        } else {
            throw new Error('Map data is missing required fields');
        }
        renderMap();
    } catch (error) {
        console.error('Error loading map:', error);
    }
}

function renderMap() {
    if (map.tiles) {
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const tile = map.tiles[y][x];
                const image = tileImages[tile];
                if (image) {
                    ctx.drawImage(image, x * tileSize - camera.x, y * tileSize - camera.y, tileSize, tileSize);
                }
            }
        }
    }
}

function isCollision(x, y) {
    const mapX1 = Math.floor(x / tileSize);
    const mapY1 = Math.floor(y / tileSize);
    const mapX2 = Math.floor((x + spriteWidth - 1) / tileSize); // Use -1 to handle edge case
    const mapY2 = Math.floor((y + spriteHeight - 1) / tileSize); // Use -1 to handle edge case

    if (mapX1 < 0 || mapX2 >= map.width || mapY1 < 0 || mapY2 >= map.height) {
        console.log(`Collision detected: Out of map bounds (x: ${x}, y: ${y})`);
        return true; 
    }

    for (let row = mapY1; row <= mapY2; row++) {
        for (let col = mapX1; col <= mapX2; col++) {
            if (map.tiles[row][col] === 1) {
                console.log(`Collision detected: Tile (row: ${row}, col: ${col}) at (x: ${x}, y: ${y})`);
                return true;
            }
        }
    }

    return false;
}





function update() {
    let newX = player.x;
    let newY = player.y;

    if (keys['ArrowUp'] || keys['KeyW']) {
        newY -= player.speed;
        changeSprite('w');
    }
    if (keys['ArrowDown'] || keys['KeyS']) {
        newY += player.speed;
        changeSprite('s');
    }
    if (keys['ArrowLeft'] || keys['KeyA']) {
        newX -= player.speed;
        changeSprite('a');
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        newX += player.speed;
        changeSprite('d');
    }

    if (!isCollision(newX, newY)) {
        player.x = newX;
        player.y = newY;
    } else {
        console.log(`Player collision at (x: ${player.x}, y: ${player.y})`);
    }

    camera.x = Math.max(0, Math.min(map.width * tileSize - canvas.width, player.x - canvas.width / 2));
    camera.y = Math.max(0, Math.min(map.height * tileSize - canvas.height, player.y - canvas.height / 2));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderMap();

    if (spriteImage.complete) {
        ctx.drawImage(spriteImage, player.x - camera.x, player.y - camera.y, spriteWidth, spriteHeight);
    }

    if (!keys['ArrowUp'] && !keys['ArrowDown'] && !keys['ArrowLeft'] && !keys['ArrowRight']
        && !keys['KeyW'] && !keys['KeyS'] && !keys['KeyA'] && !keys['KeyD']) {
        changeSprite('idle');
    }

    requestAnimationFrame(update);
}




function changeSprite(direction) {
    if (currentSprite !== direction) {
        currentSprite = direction;
        spriteImage = spriteImageObjects[currentSprite];
    }
}

window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

window.onload = loadAssets;
