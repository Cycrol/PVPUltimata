// Player 2 (Arrow key controls)
const player2 = {
    element: null,
    x: 0,
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
        this.element = document.getElementById('player2');
        this.sprite = spriteSelection.getSelectedSprite(2);
        
        this.x = container.clientWidth - 100 - this.WIDTH;
        const top = terrain.getTopAt(this.x);
        this.y = top !== null ? top - this.HEIGHT : 0;
        
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
        if (input.arrowLeft) {
            this.velocityX = -this.MOVE_SPEED;
        } else if (input.arrowRight) {
            this.velocityX = this.MOVE_SPEED;
        } else {
            this.velocityX = 0;
        }

        // Handle jump input
        if (input.arrowUp && !this.isJumping) {
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
                    let minX = Infinity;
                    for (const b of hBlocks) if (b.x < minX) minX = b.x;
                    if (minX !== Infinity) newX = minX - this.WIDTH - 0.01;
                } else {
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
                let minY = Infinity;
                for (const b of vBlocks) if (b.y < minY) minY = b.y;
                if (minY !== Infinity) {
                    newY = minY - this.HEIGHT - 0.01;
                    this.velocityY = 0;
                    this.isJumping = false;
                }
            } else if (this.velocityY < 0) {
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
                this.y = below.y - this.HEIGHT;
                this.velocityY = 0;
                this.isJumping = false;
            } else if (this.velocityY < 0) {
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

// Initialization handled by spriteSelection.startGame()
