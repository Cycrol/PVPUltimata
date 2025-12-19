// Global input state
const input = {
    w: false,
    a: false,
    s: false,
    d: false,
    key1: false,
    key2: false,
    key3: false,
    key4: false,
    i: false,
    j: false,
    k: false,
    l: false,
    key7: false,
    key8: false,
    key9: false,
    key0: false,
    mouseX: 0,
    mouseY: 0
};

// Game state
const gameState = {
    isGameOver: false,
    winner: null,
    UPPER_BARRIER: 100  // Distance from top to allow
};

// Track mouse position
document.addEventListener('mousemove', (e) => {
    input.mouseX = e.clientX;
    input.mouseY = e.clientY;
});

// Sprite selection state
const spriteSelection = {
    player1Selected: null,
    player2Selected: null,
    gameStarted: false,
    
    sprites: {
        choices: [
            { name: 'Lord of the Mysteries', color: '#9b59b6' },
            { name: 'Minecraft', color: '#2ecc71' },
            { name: 'Ninjago', color: '#111111' }
        ]
    },

    selectSprite(player, spriteIndex) {
        if (player === 1) {
            this.player1Selected = spriteIndex;
        } else {
            this.player2Selected = spriteIndex;
        }
        this.updateUI();
        this.checkIfBothReady();
    },

    updateUI() {
        const title = document.getElementById('selectionTitle');
        const statusText = document.getElementById('statusText');
        const p1Selected = this.player1Selected !== null;
        const p2Selected = this.player2Selected !== null;

            let statusStr = '';
            if (p1Selected) statusStr += '✓ Player 1 Ready  ';
            else statusStr += '✗ Player 1 Waiting  ';
        
            if (p2Selected) statusStr += '✓ Player 2 Ready';
            else statusStr += '✗ Player 2 Waiting';
        
            title.textContent = 'Both Players - Choose Your Sprites';
            statusText.textContent = statusStr;
    },

    checkIfBothReady() {
        if (this.player1Selected !== null && this.player2Selected !== null) {
            this.startGame();
        }
    },

    startGame() {
        this.gameStarted = true;
        document.getElementById('spriteSelectionModal').style.display = 'none';
        document.getElementById('info').style.display = 'block';
        // Initialize players and start the main game loop
        try {
            if (typeof player1 !== 'undefined' && typeof player1.init === 'function') player1.init();
        } catch (e) { console.error('player1 init failed', e); }
        try {
            if (typeof player2 !== 'undefined' && typeof player2.init === 'function') player2.init();
        } catch (e) { console.error('player2 init failed', e); }

        if (!window.gameLoopRunning) {
            window.gameLoopRunning = true;
            window.gameLoop = setInterval(() => {
                // Check for game over
                if (window.player1HP <= 0) {
                    clearInterval(window.gameLoop);
                    endGame('player2');
                    return;
                }
                if (window.player2HP <= 0) {
                    clearInterval(window.gameLoop);
                    endGame('player1');
                    return;
                }
                
                try { player1.update(); } catch (e) {}
                try { player2.update(); } catch (e) {}
                try { projectiles.update(); } catch (e) {}
                try { projectiles.render(); } catch (e) {}
                try { abilityCooldowns.update(); } catch (e) {}
                try { updateAbilityUI('player1'); } catch (e) {}
                try { updateAbilityUI('player2'); } catch (e) {}
            }, 1000 / 60);
        }
        // Create HUD: player icons and healthbars
        try {
            const container = document.getElementById('gameContainer');
            // left icon + health
            const leftHud = document.createElement('div');
            leftHud.id = 'leftHud';
            leftHud.style.position = 'absolute';
            leftHud.style.left = '8px';
            leftHud.style.top = '8px';
            leftHud.style.zIndex = 2000;
            leftHud.innerHTML = `<div id="p1icon" style="width:48px;height:48px;border-radius:6px; border:2px solid #000"></div><div style="width:160px;margin-top:6px;"><div id=\"p1hpText\" style=\"color:#fff;font-size:12px;\">HP: 1000</div><div style=\"background:#222;width:160px;height:12px;border-radius:6px;overflow:hidden;\"><div id=\"p1hpBar\" style=\"width:100%;height:12px;background:lime;\"></div></div></div>`;
            container.appendChild(leftHud);

            const rightHud = document.createElement('div');
            rightHud.id = 'rightHud';
            rightHud.style.position = 'absolute';
            rightHud.style.right = '8px';
            rightHud.style.top = '8px';
            rightHud.style.zIndex = 2000;
            rightHud.innerHTML = `<div id="p2icon" style="width:48px;height:48px;border-radius:6px; border:2px solid #000"></div><div style="width:160px;margin-top:6px;text-align:right;"><div id=\"p2hpText\" style=\"color:#fff;font-size:12px;\">HP: 1000</div><div style=\"background:#222;width:160px;height:12px;border-radius:6px;overflow:hidden;margin-left:auto;\"><div id=\"p2hpBar\" style=\"width:100%;height:12px;background:lime;\"></div></div></div>`;
            container.appendChild(rightHud);

            // set icons based on selection
            const p1sprite = spriteSelection.getSelectedSprite(1);
            const p2sprite = spriteSelection.getSelectedSprite(2);
            const p1icon = document.getElementById('p1icon');
            const p2icon = document.getElementById('p2icon');
            if (p1icon) p1icon.style.background = p1sprite.color;
            if (p2icon) p2icon.style.background = p2sprite.color;

            // health values
            window.player1HP = 1000;
            window.player2HP = 1000;
            
            // Create ability UI if Lord of the Mysteries is selected
            if (spriteSelection.getSelectedSprite(1).name === 'Lord of the Mysteries') {
                createAbilityUI('player1');
            }
            if (spriteSelection.getSelectedSprite(2).name === 'Lord of the Mysteries') {
                createAbilityUI('player2');
            }
        } catch (e) { console.error('HUD setup failed', e); }
    },

    getSelectedSprite(player) {
            const choice = this.sprites.choices[(player === 1) ? this.player1Selected : this.player2Selected];
            if (!choice) return { color: '#999', shape: 'square' };
            return { color: choice.color, shape: 'square' };
    }
};

// Initialize sprite selection UI
window.addEventListener('DOMContentLoaded', () => {
    const spriteOptions = document.getElementById('spriteOptions');
    spriteOptions.style.display = 'flex';
    spriteOptions.style.gap = '60px';
    spriteOptions.style.justifyContent = 'center';
    
    // Player 1 section
    const player1Section = document.createElement('div');
    player1Section.style.textAlign = 'center';
    
    const p1Label = document.createElement('h3');
    p1Label.textContent = 'Player 1 (WASD)';
    p1Label.style.color = '#FFD700';
    p1Label.style.marginBottom = '15px';
    p1Label.style.fontSize = '16px';
    player1Section.appendChild(p1Label);
    
    const p1Options = document.createElement('div');
    p1Options.style.display = 'flex';
    p1Options.style.flexDirection = 'column';
    p1Options.style.gap = '15px';
    
    // Build unified choices for both players
    const player2Section = document.createElement('div');
    player2Section.style.textAlign = 'center';
    const p2Label = document.createElement('h3');
    p2Label.textContent = 'Player 2 (IJKL)';
    p2Label.style.color = '#FFD700';
    p2Label.style.marginBottom = '15px';
    p2Label.style.fontSize = '16px';
    player2Section.appendChild(p2Label);

    const p2Options = document.createElement('div');
    p2Options.style.display = 'flex';
    p2Options.style.flexDirection = 'column';
    p2Options.style.gap = '15px';

    const choices = spriteSelection.sprites.choices || [];
    choices.forEach((choice, idx) => {
        // option for player1
        const opt1 = document.createElement('div');
        opt1.className = 'sprite-option';
        opt1.style.display = 'flex';
        opt1.style.alignItems = 'center';
        opt1.style.gap = '10px';
        opt1.style.cursor = 'pointer';
        const prev1 = document.createElement('div');
        prev1.className = 'sprite-preview';
        prev1.style.backgroundColor = choice.color;
        prev1.style.width = '40px'; prev1.style.height = '40px'; prev1.style.borderRadius = '6px';
        const lbl1 = document.createElement('div'); lbl1.className = 'sprite-label'; lbl1.textContent = choice.name;
        opt1.appendChild(prev1); opt1.appendChild(lbl1);
        opt1.onclick = () => { spriteSelection.selectSprite(1, idx); opt1.style.outline = '3px solid #FFD700'; };
        p1Options.appendChild(opt1);

        // option for player2 (clone)
        const opt2 = document.createElement('div');
        opt2.className = 'sprite-option';
        opt2.style.display = 'flex';
        opt2.style.alignItems = 'center';
        opt2.style.gap = '10px';
        opt2.style.cursor = 'pointer';
        const prev2 = document.createElement('div');
        prev2.className = 'sprite-preview';
        prev2.style.backgroundColor = choice.color;
        prev2.style.width = '40px'; prev2.style.height = '40px'; prev2.style.borderRadius = '6px';
        const lbl2 = document.createElement('div'); lbl2.className = 'sprite-label'; lbl2.textContent = choice.name;
        opt2.appendChild(prev2); opt2.appendChild(lbl2);
        opt2.onclick = () => { spriteSelection.selectSprite(2, idx); opt2.style.outline = '3px solid #FFD700'; };
        p2Options.appendChild(opt2);
    });

    player1Section.appendChild(p1Options);
    player2Section.appendChild(p2Options);
    spriteOptions.appendChild(player1Section);
    spriteOptions.appendChild(player2Section);
    
    spriteSelection.updateUI();
});

// Key down handler
window.addEventListener('keydown', (e) => {
    if (!spriteSelection.gameStarted) return;
    
    const key = e.key.toLowerCase();

    // Player 1 (CFB for left/up/right + V for PA, 1-4 for abilities)
    if (key === 'c') input.a = true;
    if (key === 'f') input.w = true;
    if (key === 'b') input.d = true;
    if (key === 'v') { input.s = true; player1_PA(); }
    if (key === '1') { input.key1 = true; player1_ability_1(); }
    if (key === '2') { input.key2 = true; player1_ability_2(); }
    if (key === '3') { input.key3 = true; player1_ability_3(); }
    if (key === '4') { input.key4 = true; player1_ability_4(); }

    // Player 2 (Arrow keys + Down for PA, 7-0 for abilities)
    if (key === 'arrowup') input.i = true;
    if (key === 'arrowleft') input.j = true;
    if (key === 'arrowright') input.l = true;
    if (key === 'arrowdown') { input.k = true; player2_PA(); }
    if (key === '7') { input.key7 = true; player2_ability_1(); }
    if (key === '8') { input.key8 = true; player2_ability_2(); }
    if (key === '9') { input.key9 = true; player2_ability_3(); }
    if (key === '0') { input.key0 = true; player2_ability_4(); }
});

// Key up handler
window.addEventListener('keyup', (e) => {
    if (!spriteSelection.gameStarted) return;
    
    const key = e.key.toLowerCase();

    // Player 1 (CFB + V, 1-4)
    if (key === 'f') input.w = false;
    if (key === 'c') input.a = false;
    if (key === 'v') input.s = false;
    if (key === 'b') input.d = false;
    if (key === '1') input.key1 = false;
    if (key === '2') input.key2 = false;
    if (key === '3') input.key3 = false;
    if (key === '4') input.key4 = false;

    // Player 2 (Arrow keys + Down, 7-0)
    if (key === 'arrowup') input.i = false;
    if (key === 'arrowleft') input.j = false;
    if (key === 'arrowdown') input.k = false;
    if (key === 'arrowright') input.l = false;
    if (key === '7') input.key7 = false;
    if (key === '8') input.key8 = false;
    if (key === '9') input.key9 = false;
    if (key === '0') input.key0 = false;
});

// Helper function to check if a projectile hits terrain
function checkProjectileTerrainCollision(projectile) {
    if (typeof terrain === 'undefined' || !terrain.blocks) return false;
    
    for (const block of terrain.blocks) {
        // Simple AABB collision
        if (!(projectile.x + projectile.width < block.x || 
              projectile.x > block.x + block.width ||
              projectile.y + projectile.height < block.y || 
              projectile.y > block.y + block.height)) {
            return true;
        }
    }
    return false;
}

// Paralysis system
const paralysisSystem = {
    player1ParalysisEnd: 0,
    player2ParalysisEnd: 0,
    
    paralyze(player, duration) {
        const endTime = Date.now() + (duration * 1000);
        if (player === 'player1') {
            this.player1ParalysisEnd = Math.max(this.player1ParalysisEnd, endTime);
        } else {
            this.player2ParalysisEnd = Math.max(this.player2ParalysisEnd, endTime);
        }
    },
    
    isParalyzed(player) {
        if (player === 'player1') {
            return Date.now() < this.player1ParalysisEnd;
        } else {
            return Date.now() < this.player2ParalysisEnd;
        }
    },
    
    getParalysisTimeRemaining(player) {
        if (player === 'player1') {
            return Math.max(0, (this.player1ParalysisEnd - Date.now()) / 1000);
        } else {
            return Math.max(0, (this.player2ParalysisEnd - Date.now()) / 1000);
        }
    }
};

// Projectile system
const projectiles = {
    list: [],
    
    add(projectile) {
        this.list.push(projectile);
    },
    
    update() {
        for (let i = this.list.length - 1; i >= 0; i--) {
            const proj = this.list[i];
            proj.update();
            if (proj.destroyed) {
                this.list.splice(i, 1);
            }
        }
    },
    
    render() {
        for (const proj of this.list) {
            proj.render();
        }
    }
};

// Cooldown tracking for abilities
const abilityCooldowns = {
    player1: {
        PA: 0,
        ability1: 0,
        ability2: 0,
        ability3: 0,
        ability4: 0
    },
    player2: {
        PA: 0,
        ability1: 0,
        ability2: 0,
        ability3: 0,
        ability4: 0
    },
    
    update(deltaTime = 1/60) {
        for (let player in this) {
            if (player !== 'update' && typeof this[player] === 'object') {
                for (let ability in this[player]) {
                    if (this[player][ability] > 0) {
                        this[player][ability] -= deltaTime;
                    }
                }
            }
        }
    },
    
    canUse(player, ability) {
        return this[player][ability] <= 0;
    },
    
    use(player, ability, cooldown) {
        this[player][ability] = cooldown;
    }
};

// Player 1 ability functions
function player1_PA() {
    if (!spriteSelection.gameStarted) return;
    const spriteName = spriteSelection.sprites.choices[spriteSelection.player1Selected].name;
    
    if (spriteName === 'Lord of the Mysteries') {
        if (abilityCooldowns.canUse('player1', 'PA')) {
            lorMystery_player1_PA();
            abilityCooldowns.use('player1', 'PA', 0.1);
        }
    } else {
        console.log('player1_PA');
    }
}

function player1_ability_1() {
    if (!spriteSelection.gameStarted) return;
    const spriteName = spriteSelection.sprites.choices[spriteSelection.player1Selected].name;
    
    if (spriteName === 'Lord of the Mysteries') {
        if (abilityCooldowns.canUse('player1', 'ability1')) {
            lorMystery_player1_ability_1();
            abilityCooldowns.use('player1', 'ability1', 5);
        }
    } else {
        console.log('player1_ability_1');
    }
}

function player1_ability_2() {
    if (!spriteSelection.gameStarted) return;
    const spriteName = spriteSelection.sprites.choices[spriteSelection.player1Selected].name;
    
    if (spriteName === 'Lord of the Mysteries') {
        if (abilityCooldowns.canUse('player1', 'ability2')) {
            lorMystery_player1_ability_2();
            abilityCooldowns.use('player1', 'ability2', 25);
        }
    } else {
        console.log('player1_ability_2');
    }
}

function player1_ability_3() {
    if (!spriteSelection.gameStarted) return;
    const spriteName = spriteSelection.sprites.choices[spriteSelection.player1Selected].name;
    
    if (spriteName === 'Lord of the Mysteries') {
        if (abilityCooldowns.canUse('player1', 'ability3')) {
            lorMystery_player1_ability_3();
            abilityCooldowns.use('player1', 'ability3', 50);
        }
    } else {
        console.log('player1_ability_3');
    }
}

function player1_ability_4() {
    if (!spriteSelection.gameStarted) return;
    const spriteName = spriteSelection.sprites.choices[spriteSelection.player1Selected].name;
    
    if (spriteName === 'Lord of the Mysteries') {
        if (abilityCooldowns.canUse('player1', 'ability4')) {
            lorMystery_player1_ability_4();
            abilityCooldowns.use('player1', 'ability4', 40);
        }
    } else {
        console.log('player1_ability_4');
    }
}

// Lord of the Mysteries - Player 1 abilities
function lorMystery_player1_PA() {
    const rect = document.createElement('div');
    rect.style.position = 'absolute';
    rect.style.width = '15px';
    rect.style.height = '10px';
    rect.style.backgroundColor = '#9b59b6';
    rect.style.zIndex = '100';
    document.getElementById('gameContainer').appendChild(rect);
    
    // Calculate direction to player2 (opponent)
    const player1CenterX = player1.x + player1.WIDTH / 2;
    const player1CenterY = player1.y + player1.HEIGHT / 2;
    const player2CenterX = player2.x + player2.WIDTH / 2;
    const player2CenterY = player2.y + player2.HEIGHT / 2;
    const dx = player2CenterX - player1CenterX;
    const dy = player2CenterY - player1CenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const vx = (dx / distance) * 8;
    const vy = (dy / distance) * 8;
    
    const proj = {
        element: rect,
        x: player1CenterX,
        y: player1CenterY,
        vx: vx,
        vy: vy,
        width: 15,
        height: 10,
        damage: 5,
        destroyed: false,
        owner: 'player1',
        hasHitPlayer2: false,
        startX: player1CenterX,
        startY: player1CenterY,
        maxRange: 240,
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Check if traveled more than 3 blocks (max range)
            const distTraveled = Math.sqrt((this.x - this.startX) ** 2 + (this.y - this.startY) ** 2);
            if (distTraveled > this.maxRange) {
                this.destroyed = true;
                this.element.remove();
                return;
            }
            
            const container = document.getElementById('gameContainer');
            if (this.x < 0 || this.x > container.clientWidth || this.y < 0 || this.y > container.clientHeight) {
                this.destroyed = true;
                this.element.remove();
                return;
            }
            
            // Check if hitting terrain
            if (checkProjectileTerrainCollision(this)) {
                this.destroyed = true;
                this.element.remove();
                return;
            }
            
            // Check if hitting player2
            if (!this.hasHitPlayer2) {
                const player2CenterX = player2.x + player2.WIDTH / 2;
                const player2CenterY = player2.y + player2.HEIGHT / 2;
                const dist = Math.sqrt((this.x - player2CenterX) ** 2 + (this.y - player2CenterY) ** 2);
                if (dist < 40) {
                    window.player2HP = Math.max(0, window.player2HP - this.damage);
                    updateHUD();
                    this.destroyed = true;
                    this.element.remove();
                    this.hasHitPlayer2 = true;
                }
            }
        },
        
        render() {
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
        }
    };
    
    projectiles.add(proj);
}

function lorMystery_player1_ability_1() {
    // Regain 1% of lost health
    const healthLost = 1000 - window.player1HP;
    const healthRegain = Math.ceil(healthLost * 0.01);
    window.player1HP = Math.min(1000, window.player1HP + healthRegain);
    updateHUD();
    
    // Calculate direction to player2 from player1 center
    const player1CenterX = player1.x + player1.WIDTH / 2;
    const player1CenterY = player1.y + player1.HEIGHT / 2;
    const player2CenterX = player2.x + player2.WIDTH / 2;
    const player2CenterY = player2.y + player2.HEIGHT / 2;
    const dx = player2CenterX - player1CenterX;
    const dy = player2CenterY - player1CenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const baseAngle = Math.atan2(dy, dx);
    
    // Shoot three orbs spaced evenly at opponent
    const angles = [baseAngle - Math.PI / 6, baseAngle, baseAngle + Math.PI / 6];
    for (let angle of angles) {
        const orb = document.createElement('div');
        orb.style.position = 'absolute';
        orb.style.width = '12px';
        orb.style.height = '12px';
        orb.style.backgroundColor = '#9b59b6';
        orb.style.borderRadius = '50%';
        orb.style.zIndex = '100';
        document.getElementById('gameContainer').appendChild(orb);
        
        const proj = {
            element: orb,
            x: player1CenterX,
            y: player1CenterY,
            vx: Math.cos(angle) * 6,
            vy: Math.sin(angle) * 6,
            width: 12,
            height: 12,
            damage: 50,
            destroyed: false,
            owner: 'player1',
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                const container = document.getElementById('gameContainer');
                if (this.x < 0 || this.x > container.clientWidth || this.y < 0 || this.y > container.clientHeight) {
                    this.destroyed = true;
                    this.element.remove();
                    return;
                }
                
                // Check if hitting terrain
                if (checkProjectileTerrainCollision(this)) {
                    this.destroyed = true;
                    this.element.remove();
                    return;
                }
            },
            
            render() {
                this.element.style.left = this.x + 'px';
                this.element.style.top = this.y + 'px';
            }
        };
        
        projectiles.add(proj);
    }
}

function lorMystery_player1_ability_2() {
    // Calculate direction to player2 from player1 center
    const player1CenterX = player1.x + player1.WIDTH / 2;
    const player1CenterY = player1.y + player1.HEIGHT / 2;
    const player2CenterX = player2.x + player2.WIDTH / 2;
    const player2CenterY = player2.y + player2.HEIGHT / 2;
    const dx = player2CenterX - player1CenterX;
    const dy = player2CenterY - player1CenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const baseAngle = Math.atan2(dy, dx);
    
    // Shoot three lines spaced around the direction toward opponent
    const lineAngles = [baseAngle - Math.PI / 6, baseAngle, baseAngle + Math.PI / 6];
    
    for (let angle of lineAngles) {
        // Create a line projectile (visual representation)
        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.width = '200px';
        line.style.height = '4px';
        line.style.backgroundColor = '#9b59b6';
        line.style.zIndex = '100';
        line.style.transformOrigin = '0 50%';
        line.style.transform = `rotate(${angle}rad)`;
        document.getElementById('gameContainer').appendChild(line);
        
        const proj = {
            element: line,
            x: player1CenterX,
            y: player1CenterY,
            angle: angle,
            vx: Math.cos(angle) * 8,
            vy: Math.sin(angle) * 8,
            width: 200,
            height: 4,
            damage: 0,
            destroyed: false,
            owner: 'player1',
            lifetime: 0.3,
            maxLifetime: 0.3,
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.lifetime -= 1/60;
                
                const container = document.getElementById('gameContainer');
                if (this.lifetime <= 0 || this.x < -200 || this.x > container.clientWidth || this.y < -200 || this.y > container.clientHeight) {
                    this.destroyed = true;
                    this.element.remove();
                    return;
                }
                
                // Check if hitting terrain
                if (checkProjectileTerrainCollision(this)) {
                    this.destroyed = true;
                    this.element.remove();
                    return;
                }
                
                // Check if hitting player2
                if (!this.hasHitPlayer2 && this.owner === 'player1') {
                    const player2CenterX = player2.x + player2.WIDTH / 2;
                    const player2CenterY = player2.y + player2.HEIGHT / 2;
                    const dist = Math.sqrt((this.x - player2CenterX) ** 2 + (this.y - player2CenterY) ** 2);
                    if (dist < 50) {
                        paralysisSystem.paralyze('player2', 10);
                        this.hasHitPlayer2 = true;
                    }
                }
            },
            
            render() {
                this.element.style.left = this.x + 'px';
                this.element.style.top = this.y + 'px';
            }
        };
        
        projectiles.add(proj);
    }
    
    // Paralyze feedback
    console.log('lorMystery_player1_ability_2 - fired three lines toward mouse');
}

function lorMystery_player1_ability_3() {
    // Remove 30% of opponent's current health (guaranteed hit)
    const damageAmount = Math.ceil(window.player2HP * 0.3);
    window.player2HP = Math.max(0, window.player2HP - damageAmount);
    updateHUD();
    console.log('lorMystery_player1_ability_3 - dealt ' + damageAmount + ' damage to player2');
}

function lorMystery_player1_ability_4() {
    // Calculate direction to player2 from player1 center
    const player1CenterX = player1.x + player1.WIDTH / 2;
    const player1CenterY = player1.y + player1.HEIGHT / 2;
    const player2CenterX = player2.x + player2.WIDTH / 2;
    const player2CenterY = player2.y + player2.HEIGHT / 2;
    const dx = player2CenterX - player1CenterX;
    const dy = player2CenterY - player1CenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const baseAngle = Math.atan2(dy, dx);
    
    // Shoot five shields spaced evenly toward opponent
    const shieldAngles = [];
    for (let i = 0; i < 5; i++) {
        shieldAngles.push(baseAngle - Math.PI / 4 + (i * Math.PI / 10));
    }
    
    for (let angle of shieldAngles) {
        // Create triangle shield
        const shield = document.createElement('div');
        shield.style.position = 'absolute';
        shield.style.width = '0';
        shield.style.height = '0';
        shield.style.borderLeft = '10px solid transparent';
        shield.style.borderRight = '10px solid transparent';
        shield.style.borderBottom = '18px solid #9b59b6';
        shield.style.zIndex = '100';
        shield.style.transform = `rotate(${angle}rad)`;
        document.getElementById('gameContainer').appendChild(shield);
        
        const proj = {
            element: shield,
            x: player1CenterX,
            y: player1CenterY,
            angle: angle,
            vx: Math.cos(angle) * 7,
            vy: Math.sin(angle) * 7,
            width: 20,
            height: 18,
            damage: 50,
            destroyed: false,
            owner: 'player1',
            isShield: true,
            blockedAttacks: 0,
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                const container = document.getElementById('gameContainer');
                if (this.x < -20 || this.x > container.clientWidth + 20 || this.y < -20 || this.y > container.clientHeight + 20) {
                    this.destroyed = true;
                    this.element.remove();
                    return;
                }
                
                // Check if hitting terrain
                if (checkProjectileTerrainCollision(this)) {
                    this.destroyed = true;
                    this.element.remove();
                    return;
                }
                
                // Check if hitting player2
                if (!this.hasHitPlayer2) {
                    const player2CenterX = player2.x + player2.WIDTH / 2;
                    const player2CenterY = player2.y + player2.HEIGHT / 2;
                    const dist = Math.sqrt((this.x - player2CenterX) ** 2 + (this.y - player2CenterY) ** 2);
                    if (dist < 40) {
                        window.player2HP = Math.max(0, window.player2HP - 50);
                        updateHUD();
                        this.destroyed = true;
                        this.element.remove();
                        this.hasHitPlayer2 = true;
                    }
                }
            },
            
            render() {
                this.element.style.left = this.x + 'px';
                this.element.style.top = this.y + 'px';
            }
        };
        
        projectiles.add(proj);
    }
    
    console.log('lorMystery_player1_ability_4 - fired five shield triangles toward mouse');
}

// Player 2 ability functions
function player2_PA() {
    if (!spriteSelection.gameStarted) return;
    const spriteName = spriteSelection.sprites.choices[spriteSelection.player2Selected].name;
    
    if (spriteName === 'Lord of the Mysteries') {
        if (abilityCooldowns.canUse('player2', 'PA')) {
            lorMystery_player2_PA();
            abilityCooldowns.use('player2', 'PA', 0.1);
        }
    } else {
        console.log('player2_PA');
    }
}

function player2_ability_1() {
    if (!spriteSelection.gameStarted) return;
    const spriteName = spriteSelection.sprites.choices[spriteSelection.player2Selected].name;
    
    if (spriteName === 'Lord of the Mysteries') {
        if (abilityCooldowns.canUse('player2', 'ability1')) {
            lorMystery_player2_ability_1();
            abilityCooldowns.use('player2', 'ability1', 5);
        }
    } else {
        console.log('player2_ability_1');
    }
}

function player2_ability_2() {
    if (!spriteSelection.gameStarted) return;
    const spriteName = spriteSelection.sprites.choices[spriteSelection.player2Selected].name;
    
    if (spriteName === 'Lord of the Mysteries') {
        if (abilityCooldowns.canUse('player2', 'ability2')) {
            lorMystery_player2_ability_2();
            abilityCooldowns.use('player2', 'ability2', 25);
        }
    } else {
        console.log('player2_ability_2');
    }
}

function player2_ability_3() {
    if (!spriteSelection.gameStarted) return;
    const spriteName = spriteSelection.sprites.choices[spriteSelection.player2Selected].name;
    
    if (spriteName === 'Lord of the Mysteries') {
        if (abilityCooldowns.canUse('player2', 'ability3')) {
            lorMystery_player2_ability_3();
            abilityCooldowns.use('player2', 'ability3', 50);
        }
    } else {
        console.log('player2_ability_3');
    }
}

function player2_ability_4() {
    if (!spriteSelection.gameStarted) return;
    const spriteName = spriteSelection.sprites.choices[spriteSelection.player2Selected].name;
    
    if (spriteName === 'Lord of the Mysteries') {
        if (abilityCooldowns.canUse('player2', 'ability4')) {
            lorMystery_player2_ability_4();
            abilityCooldowns.use('player2', 'ability4', 40);
        }
    } else {
        console.log('player2_ability_4');
    }
}

// Lord of the Mysteries - Player 2 abilities
function lorMystery_player2_PA() {
    const rect = document.createElement('div');
    rect.style.position = 'absolute';
    rect.style.width = '15px';
    rect.style.height = '10px';
    rect.style.backgroundColor = '#9b59b6';
    rect.style.zIndex = '100';
    document.getElementById('gameContainer').appendChild(rect);
    
    // Calculate direction to player1 (opponent)
    const player2CenterX = player2.x + player2.WIDTH / 2;
    const player2CenterY = player2.y + player2.HEIGHT / 2;
    const player1CenterX = player1.x + player1.WIDTH / 2;
    const player1CenterY = player1.y + player1.HEIGHT / 2;
    const dx = player1CenterX - player2CenterX;
    const dy = player1CenterY - player2CenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const vx = (dx / distance) * 8;
    const vy = (dy / distance) * 8;
    
    const proj = {
        element: rect,
        x: player2CenterX,
        y: player2CenterY,
        vx: vx,
        vy: vy,
        width: 15,
        height: 10,
        damage: 5,
        destroyed: false,
        owner: 'player2',
        hasHitPlayer1: false,
        startX: player2CenterX,
        startY: player2CenterY,
        maxRange: 240,
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Check if traveled more than 3 blocks (max range)
            const distTraveled = Math.sqrt((this.x - this.startX) ** 2 + (this.y - this.startY) ** 2);
            if (distTraveled > this.maxRange) {
                this.destroyed = true;
                this.element.remove();
                return;
            }
            
            const container = document.getElementById('gameContainer');
            if (this.x < 0 || this.x > container.clientWidth || this.y < 0 || this.y > container.clientHeight) {
                this.destroyed = true;
                this.element.remove();
                return;
            }
            
            // Check if hitting terrain
            if (checkProjectileTerrainCollision(this)) {
                this.destroyed = true;
                this.element.remove();
                return;
            }
            
            // Check if hitting player1
            if (!this.hasHitPlayer1) {
                const player1CenterX = player1.x + player1.WIDTH / 2;
                const player1CenterY = player1.y + player1.HEIGHT / 2;
                const dist = Math.sqrt((this.x - player1CenterX) ** 2 + (this.y - player1CenterY) ** 2);
                if (dist < 40) {
                    window.player1HP = Math.max(0, window.player1HP - this.damage);
                    updateHUD();
                    this.destroyed = true;
                    this.element.remove();
                    this.hasHitPlayer1 = true;
                }
            }
        },
        
        render() {
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
        }
    };
    
    projectiles.add(proj);
}

function lorMystery_player2_ability_1() {
    // Regain 1% of lost health
    const healthLost = 1000 - window.player2HP;
    const healthRegain = Math.ceil(healthLost * 0.01);
    window.player2HP = Math.min(1000, window.player2HP + healthRegain);
    updateHUD();
    
    // Calculate direction to player1 from player2 center
    const player2CenterX = player2.x + player2.WIDTH / 2;
    const player2CenterY = player2.y + player2.HEIGHT / 2;
    const player1CenterX = player1.x + player1.WIDTH / 2;
    const player1CenterY = player1.y + player1.HEIGHT / 2;
    const dx = player1CenterX - player2CenterX;
    const dy = player1CenterY - player2CenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const baseAngle = Math.atan2(dy, dx);
    
    // Shoot three orbs spaced evenly at opponent
    const angles = [baseAngle - Math.PI / 6, baseAngle, baseAngle + Math.PI / 6];
    for (let angle of angles) {
        const orb = document.createElement('div');
        orb.style.position = 'absolute';
        orb.style.width = '12px';
        orb.style.height = '12px';
        orb.style.backgroundColor = '#9b59b6';
        orb.style.borderRadius = '50%';
        orb.style.zIndex = '100';
        document.getElementById('gameContainer').appendChild(orb);
        
        const proj = {
            element: orb,
            x: player2CenterX,
            y: player2CenterY,
            vx: Math.cos(angle) * 6,
            vy: Math.sin(angle) * 6,
            width: 12,
            height: 12,
            damage: 50,
            destroyed: false,
            owner: 'player2',
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                const container = document.getElementById('gameContainer');
                if (this.x < 0 || this.x > container.clientWidth || this.y < 0 || this.y > container.clientHeight) {
                    this.destroyed = true;
                    this.element.remove();
                    return;
                }
                
                // Check if hitting terrain
                if (checkProjectileTerrainCollision(this)) {
                    this.destroyed = true;
                    this.element.remove();
                    return;
                }
            },
            
            render() {
                this.element.style.left = this.x + 'px';
                this.element.style.top = this.y + 'px';
            }
        };
        
        projectiles.add(proj);
    }
}

function lorMystery_player2_ability_2() {
    // Calculate direction to player1 from player2 center
    const player2CenterX = player2.x + player2.WIDTH / 2;
    const player2CenterY = player2.y + player2.HEIGHT / 2;
    const player1CenterX = player1.x + player1.WIDTH / 2;
    const player1CenterY = player1.y + player1.HEIGHT / 2;
    const dx = player1CenterX - player2CenterX;
    const dy = player1CenterY - player2CenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const baseAngle = Math.atan2(dy, dx);
    
    // Shoot three lines spaced around the direction toward opponent
    const lineAngles = [baseAngle - Math.PI / 6, baseAngle, baseAngle + Math.PI / 6];
    
    for (let angle of lineAngles) {
        // Create a line projectile (visual representation)
        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.width = '200px';
        line.style.height = '4px';
        line.style.backgroundColor = '#9b59b6';
        line.style.zIndex = '100';
        line.style.transformOrigin = '0 50%';
        line.style.transform = `rotate(${angle}rad)`;
        line.style.visibility = 'visible';
        document.getElementById('gameContainer').appendChild(line);
        
        const proj = {
            element: line,
            x: player2CenterX,
            y: player2CenterY,
            angle: angle,
            vx: Math.cos(angle) * 8,
            vy: Math.sin(angle) * 8,
            width: 200,
            height: 4,
            damage: 0,
            destroyed: false,
            owner: 'player2',
            lifetime: 0.3,
            maxLifetime: 0.3,
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.lifetime -= 1/60;
                
                const container = document.getElementById('gameContainer');
                if (this.lifetime <= 0 || this.x < -200 || this.x > container.clientWidth || this.y < -200 || this.y > container.clientHeight) {
                    this.destroyed = true;
                    this.element.remove();
                    return;
                }
                
                // Check if hitting terrain
                if (checkProjectileTerrainCollision(this)) {
                    this.destroyed = true;
                    this.element.remove();
                    return;
                }
                
                // Check if hitting player1
                if (!this.hasHitPlayer1 && this.owner === 'player2') {
                    const player1CenterX = player1.x + player1.WIDTH / 2;
                    const player1CenterY = player1.y + player1.HEIGHT / 2;
                    const dist = Math.sqrt((this.x - player1CenterX) ** 2 + (this.y - player1CenterY) ** 2);
                    if (dist < 50) {
                        paralysisSystem.paralyze('player1', 10);
                        this.hasHitPlayer1 = true;
                    }
                }
            },
            
            render() {
                this.element.style.left = this.x + 'px';
                this.element.style.top = this.y + 'px';
            }
        };
        
        projectiles.add(proj);
    }
    
    // Paralyze feedback
    console.log('lorMystery_player2_ability_2 - fired three lines toward mouse');
}

function lorMystery_player2_ability_3() {
    // Remove 30% of opponent's current health (guaranteed hit)
    const damageAmount = Math.ceil(window.player1HP * 0.3);
    window.player1HP = Math.max(0, window.player1HP - damageAmount);
    updateHUD();
    console.log('lorMystery_player2_ability_3 - dealt ' + damageAmount + ' damage to player1');
}

function lorMystery_player2_ability_4() {
    // Calculate direction to player1 (opponent) from player2 center
    const player2CenterX = player2.x + player2.WIDTH / 2;
    const player2CenterY = player2.y + player2.HEIGHT / 2;
    const player1CenterX = player1.x + player1.WIDTH / 2;
    const player1CenterY = player1.y + player1.HEIGHT / 2;
    const dx = player1CenterX - player2CenterX;
    const dy = player1CenterY - player2CenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const baseAngle = Math.atan2(dy, dx);
    
    // Shoot five shields spaced evenly
    const shieldAngles = [];
    for (let i = 0; i < 5; i++) {
        shieldAngles.push(baseAngle - Math.PI / 4 + (i * Math.PI / 10));
    }
    
    for (let angle of shieldAngles) {
        // Create triangle shield
        const shield = document.createElement('div');
        shield.style.position = 'absolute';
        shield.style.width = '0';
        shield.style.height = '0';
        shield.style.borderLeft = '10px solid transparent';
        shield.style.borderRight = '10px solid transparent';
        shield.style.borderBottom = '18px solid #9b59b6';
        shield.style.zIndex = '100';
        shield.style.transform = `rotate(${angle}rad)`;
        document.getElementById('gameContainer').appendChild(shield);
        
        const proj = {
            element: shield,
            x: player2CenterX,
            y: player2CenterY,
            angle: angle,
            vx: Math.cos(angle) * 7,
            vy: Math.sin(angle) * 7,
            width: 20,
            height: 18,
            damage: 50,
            destroyed: false,
            owner: 'player2',
            isShield: true,
            blockedAttacks: 0,
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                const container = document.getElementById('gameContainer');
                if (this.x < -20 || this.x > container.clientWidth + 20 || this.y < -20 || this.y > container.clientHeight + 20) {
                    this.destroyed = true;
                    this.element.remove();
                    return;
                }
                
                // Check if hitting terrain
                if (checkProjectileTerrainCollision(this)) {
                    this.destroyed = true;
                    this.element.remove();
                    return;
                }
                
                // Check if hitting player1
                if (!this.hasHitPlayer1) {
                    const player1CenterX = player1.x + player1.WIDTH / 2;
                    const player1CenterY = player1.y + player1.HEIGHT / 2;
                    const dist = Math.sqrt((this.x - player1CenterX) ** 2 + (this.y - player1CenterY) ** 2);
                    if (dist < 40) {
                        window.player1HP = Math.max(0, window.player1HP - 50);
                        updateHUD();
                        this.destroyed = true;
                        this.element.remove();
                        this.hasHitPlayer1 = true;
                    }
                }
            },
            
            render() {
                this.element.style.left = this.x + 'px';
                this.element.style.top = this.y + 'px';
            }
        };
        
        projectiles.add(proj);
    }
    
    console.log('lorMystery_player2_ability_4 - fired five shield triangles toward mouse');
}

// HUD update function
function updateHUD() {
    const p1hpBar = document.getElementById('p1hpBar');
    const p1hpText = document.getElementById('p1hpText');
    const p2hpBar = document.getElementById('p2hpBar');
    const p2hpText = document.getElementById('p2hpText');
    
    if (p1hpBar) {
        p1hpBar.style.width = (window.player1HP / 1000) * 100 + '%';
    }
    if (p1hpText) {
        p1hpText.textContent = 'HP: ' + window.player1HP;
    }
    if (p2hpBar) {
        p2hpBar.style.width = (window.player2HP / 1000) * 100 + '%';
    }
    if (p2hpText) {
        p2hpText.textContent = 'HP: ' + window.player2HP;
    }
    
    // Update ability UI
    updateAbilityUI('player1');
    updateAbilityUI('player2');
}

// Create ability icons and timers UI
function createAbilityUI(player) {
    const abilities = ['PA', 'ability1', 'ability2', 'ability3', 'ability4'];
    const abilityLabels = ['PA', 'Ability 1', 'Ability 2', 'Ability 3', 'Ability 4'];
    
    const container = document.getElementById('gameContainer');
    const hudId = player === 'player1' ? 'leftHud' : 'rightHud';
    const hud = document.getElementById(hudId);
    
    const abilityContainer = document.createElement('div');
    abilityContainer.id = player + 'AbilityUI';
    abilityContainer.style.display = 'flex';
    abilityContainer.style.gap = '8px';
    abilityContainer.style.marginTop = '8px';
    if (player === 'player2') {
        abilityContainer.style.justifyContent = 'flex-end';
    }
    
    for (let i = 0; i < abilities.length; i++) {
        const ability = abilities[i];
        const label = abilityLabels[i];
        
        const abilityIcon = document.createElement('div');
        abilityIcon.id = player + '_' + ability + '_icon';
        abilityIcon.style.position = 'relative';
        abilityIcon.style.width = '30px';
        abilityIcon.style.height = '30px';
        abilityIcon.style.backgroundColor = '#9b59b6';
        abilityIcon.style.borderRadius = '4px';
        abilityIcon.style.display = 'flex';
        abilityIcon.style.alignItems = 'center';
        abilityIcon.style.justifyContent = 'center';
        abilityIcon.style.border = '2px solid #fff';
        abilityIcon.style.cursor = 'pointer';
        abilityIcon.title = label;
        
        // Timer text
        const timerText = document.createElement('div');
        timerText.id = player + '_' + ability + '_timer';
        timerText.style.position = 'absolute';
        timerText.style.fontSize = '10px';
        timerText.style.color = '#fff';
        timerText.style.fontWeight = 'bold';
        timerText.style.width = '100%';
        timerText.style.height = '100%';
        timerText.style.display = 'flex';
        timerText.style.alignItems = 'center';
        timerText.style.justifyContent = 'center';
        timerText.style.textShadow = '1px 1px 2px #000';
        timerText.textContent = 'R';
        
        abilityIcon.appendChild(timerText);
        abilityContainer.appendChild(abilityIcon);
    }
    
    hud.appendChild(abilityContainer);
}

// Update ability UI with cooldown timers
function updateAbilityUI(player) {
    const abilities = ['PA', 'ability1', 'ability2', 'ability3', 'ability4'];
    
    for (let ability of abilities) {
        const iconId = player + '_' + ability + '_icon';
        const timerId = player + '_' + ability + '_timer';
        const icon = document.getElementById(iconId);
        const timer = document.getElementById(timerId);
        
        if (!icon || !timer) continue;
        
        const cooldownRemaining = abilityCooldowns[player][ability];
        
        if (cooldownRemaining <= 0) {
            // Ready
            icon.style.backgroundColor = '#9b59b6';
            icon.style.opacity = '1';
            timer.textContent = 'R';
        } else {
            // On cooldown
            icon.style.backgroundColor = '#555';
            icon.style.opacity = '0.6';
            timer.textContent = cooldownRemaining.toFixed(1);
        }
    }
}

// Sprite name getter helper
Object.defineProperty(spriteSelection.sprites, 'spriteName', {
    get() {
        return this.name;
    }
});

// Fix getSelectedSprite to include name
const origGetSelectedSprite = spriteSelection.getSelectedSprite;
spriteSelection.getSelectedSprite = function(player) {
    const choice = this.sprites.choices[(player === 1) ? this.player1Selected : this.player2Selected];
    if (!choice) return { color: '#999', shape: 'square', name: 'Unknown' };
    return { color: choice.color, shape: 'square', name: choice.name };
};

// Game over function
function endGame(winner) {
    if (gameState.isGameOver) return;
    
    gameState.isGameOver = true;
    gameState.winner = winner;
    
    const container = document.getElementById('gameContainer');
    
    // Create dim overlay
    const overlay = document.createElement('div');
    overlay.id = 'gameOverOverlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    
    // Game Over text
    const gameOverText = document.createElement('div');
    gameOverText.style.fontSize = '80px';
    gameOverText.style.fontWeight = 'bold';
    gameOverText.style.color = '#ff0000';
    gameOverText.style.textShadow = '0 0 20px rgba(255, 0, 0, 0.8)';
    gameOverText.style.marginBottom = '30px';
    gameOverText.textContent = 'GAME OVER';
    
    // Winner text
    const winnerText = document.createElement('div');
    winnerText.style.fontSize = '40px';
    winnerText.style.color = '#ffff00';
    winnerText.style.marginBottom = '40px';
    winnerText.textContent = winner === 'player1' ? 'Player 1 Wins!' : 'Player 2 Wins!';
    
    // Restart button
    const restartButton = document.createElement('button');
    restartButton.textContent = 'RESTART GAME';
    restartButton.style.fontSize = '20px';
    restartButton.style.padding = '15px 40px';
    restartButton.style.backgroundColor = '#4CAF50';
    restartButton.style.color = 'white';
    restartButton.style.border = 'none';
    restartButton.style.borderRadius = '5px';
    restartButton.style.cursor = 'pointer';
    restartButton.style.fontWeight = 'bold';
    restartButton.style.transition = 'background-color 0.3s';
    restartButton.onmouseover = () => {
        restartButton.style.backgroundColor = '#45a049';
    };
    restartButton.onmouseout = () => {
        restartButton.style.backgroundColor = '#4CAF50';
    };
    restartButton.onclick = () => {
        location.reload();
    };
    
    overlay.appendChild(gameOverText);
    overlay.appendChild(winnerText);
    overlay.appendChild(restartButton);
    container.appendChild(overlay);
}
