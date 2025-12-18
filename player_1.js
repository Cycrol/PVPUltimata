// Terrain system
const terrain = {
    blocks: [],
    BLOCK_SIZE: 40,
    columns: {},
    generated: false,

    generateTerrain() {
        if (this.generated) return;
        this.generated = true;
        const container = document.getElementById('gameContainer');
        const terrainContainer = document.getElementById('terrain');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Generate irregular terrain from bottom up
        const groundLevel = height - 200;
        let heightVariation = groundLevel;

        for (let x = 0; x < width; x += this.BLOCK_SIZE) {
            // Random height variation for irregular terrain
            if (Math.random() > 0.7) {
                heightVariation += (Math.random() > 0.5 ? 1 : -1) * this.BLOCK_SIZE;
            }
            heightVariation = Math.max(groundLevel - 150, Math.min(groundLevel + 50, heightVariation));

            // Create blocks from the varied height to the bottom
            for (let y = heightVariation; y < height; y += this.BLOCK_SIZE) {
                const block = document.createElement('div');
                block.className = 'terrain-block';
                block.style.left = x + 'px';
                block.style.top = y + 'px';
                block.style.width = this.BLOCK_SIZE + 'px';
                block.style.height = this.BLOCK_SIZE + 'px';
                terrainContainer.appendChild(block);

                const blk = { x: x, y: y, width: this.BLOCK_SIZE, height: this.BLOCK_SIZE };
                this.blocks.push(blk);
                const col = Math.floor(x / this.BLOCK_SIZE);
                if (!this.columns[col]) this.columns[col] = [];
                this.columns[col].push(blk);
            }
        }
        // sort each column by y (ascending)
        for (let k in this.columns) {
            this.columns[k].sort((a,b) => a.y - b.y);
        }
        // keep a flat blocks array sorted (optional)
        this.blocks.sort((a,b) => (a.x - b.x) || (a.y - b.y));
    },

    // Find any block overlapping player's bbox (simple AABB), but optimized by columns
    isCollidingWithBlock(x, y, width, height) {
        const leftCol = Math.floor(x / this.BLOCK_SIZE);
        const rightCol = Math.floor((x + width) / this.BLOCK_SIZE);
        for (let col = leftCol; col <= rightCol; col++) {
            const column = this.columns[col];
            if (!column) continue;
            for (let block of column) {
                if (!(x + width < block.x || x > block.x + block.width ||
                      y + height < block.y || y > block.y + block.height)) {
                    return block;
                }
            }
        }
        return null;
    },

    // Return the highest block top (smallest y) under the x position; used for initial placement
    getTopAt(x) {
        const col = Math.floor(x / this.BLOCK_SIZE);
        const column = this.columns[col];
        if (!column || column.length === 0) return null;
        // return top-most block (smallest y)
        let top = column[0].y;
        for (let b of column) if (b.y < top) top = b.y;
        return top;
    },

    // Find the block directly below the player's bbox (if any)
    getBlockBelow(x, y, width, height) {
        const footY = y + height;
        const leftCol = Math.floor(x / this.BLOCK_SIZE);
        const rightCol = Math.floor((x + width) / this.BLOCK_SIZE);
        let candidate = null;
        for (let col = leftCol; col <= rightCol; col++) {
            const column = this.columns[col];
            if (!column) continue;
            for (let block of column) {
                // block top is block.y
                if (block.y <= footY && (block.y + block.height) >= (y)) {
                    if (!candidate || block.y > candidate.y) candidate = block;
                }
            }
        }
        return candidate;
    },

    // Return all blocks overlapping an area (useful to resolve collisions)
    getBlocksOverlappingArea(x, y, width, height) {
        const leftCol = Math.floor(x / this.BLOCK_SIZE);
        const rightCol = Math.floor((x + width) / this.BLOCK_SIZE);
        const out = [];
        for (let col = leftCol; col <= rightCol; col++) {
            const column = this.columns[col];
            if (!column) continue;
            for (let block of column) {
                if (!(x + width < block.x || x > block.x + block.width ||
                      y + height < block.y || y > block.y + block.height)) {
                    out.push(block);
                }
            }
        }
        return out;
    }
};

// Player 1 (WASD controls)
const player1 = {
    element: null,
    x: 100,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    sprite: null,
    
    GRAVITY: 0.6,
    JUMP_STRENGTH: -12,
    MOVE_SPEED: 5,
    WIDTH: 40,
    HEIGHT: 40,

    init() {
        const container = document.getElementById('gameContainer');
        this.element = document.getElementById('player1');
        this.sprite = spriteSelection.getSelectedSprite(1);
        
        // Generate terrain first
        terrain.generateTerrain();
        
        // Find initial ground position
        const top = terrain.getTopAt(this.x);
        this.y = top !== null ? top - this.HEIGHT : 0;
        this.x = 100;
        
        this.applySprite();
    },

    applySprite() {
        this.element.style.backgroundColor = this.sprite.color;
        if (this.sprite.shape === 'triangle') {
            this.element.style.clip = 'polygon(50% 0%, 100% 100%, 0% 100%)';
        }
    },

    update() {
        if (!spriteSelection.gameStarted) return;

        // Handle movement input
        if (input.a) {
            this.velocityX = -this.MOVE_SPEED;
        } else if (input.d) {
            this.velocityX = this.MOVE_SPEED;
        } else {
            this.velocityX = 0;
        }

        // Handle jump input
        if (input.w && !this.isJumping) {
            this.velocityY = this.JUMP_STRENGTH;
            this.isJumping = true;
        }

        // Apply gravity
        this.velocityY += this.GRAVITY;

        // Compute proposed new position
        let newX = this.x + this.velocityX;
        let newY = this.y + this.velocityY;

        // Horizontal collision: check moving to newX while keeping current y
        if (this.velocityX !== 0) {
            const hBlocks = terrain.getBlocksOverlappingArea(newX, this.y, this.WIDTH, this.HEIGHT);
            if (hBlocks.length > 0) {
                if (this.velocityX > 0) {
                    // find nearest block on the right
                    let minX = Infinity;
                    for (const b of hBlocks) if (b.x < minX) minX = b.x;
                    if (minX !== Infinity) newX = minX - this.WIDTH - 0.01;
                } else {
                    // moving left: find furthest right edge
                    let maxRight = -Infinity;
                    for (const b of hBlocks) {
                        const rightEdge = b.x + b.width;
                        if (rightEdge > maxRight) maxRight = rightEdge;
                    }
                    if (maxRight !== -Infinity) newX = maxRight + 0.01;
                }
                this.velocityX = 0;
            }
        }

        // Vertical collision: check moving to newY while using resolved newX
        const vBlocks = terrain.getBlocksOverlappingArea(newX, newY, this.WIDTH, this.HEIGHT);
        if (vBlocks.length > 0) {
            if (this.velocityY > 0) {
                // landing: find nearest top
                let minY = Infinity;
                for (const b of vBlocks) if (b.y < minY) minY = b.y;
                if (minY !== Infinity) {
                    newY = minY - this.HEIGHT - 0.01;
                    this.velocityY = 0;
                    this.isJumping = false;
                }
            } else if (this.velocityY < 0) {
                // head hit: find lowest bottom
                let maxBottom = -Infinity;
                for (const b of vBlocks) {
                    const bottom = b.y + b.height;
                    if (bottom > maxBottom) maxBottom = bottom;
                }
                if (maxBottom !== -Infinity) {
                    newY = maxBottom + 0.01;
                    this.velocityY = 0;
                }
            }
        }

        // Commit positions
        this.x = newX;
        this.y = newY;

        const container = document.getElementById('gameContainer');
        const maxX = container.clientWidth - this.WIDTH;

        // Boundary checking (left and right)
        if (this.x < 0) this.x = 0;
        if (this.x > maxX) this.x = maxX;

        // Terrain collision - improved
        const below = terrain.getBlockBelow(this.x, this.y, this.WIDTH, this.HEIGHT);
        if (below) {
            if (this.velocityY > 0) {
                // landing
                this.y = below.y - this.HEIGHT;
                this.velocityY = 0;
                this.isJumping = false;
            } else if (this.velocityY < 0) {
                // head hit
                this.y = below.y + below.height;
                this.velocityY = 0;
            }
        }

        // Death by falling off map
        if (this.y > container.clientHeight) {
            this.y = 50;
            this.velocityY = 0;
        }

        // Update element position
        this.render();
    },

    render() {
        const container = document.getElementById('gameContainer');
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }
};

// Initialize player 1 when DOM is ready
// Initialization handled by spriteSelection.startGame()
