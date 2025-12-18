// Global input state
const input = {
    w: false,
    a: false,
    s: false,
    d: false,
    arrowUp: false,
    arrowDown: false,
    arrowLeft: false,
    arrowRight: false
};

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
                try { player1.update(); } catch (e) {}
                try { player2.update(); } catch (e) {}
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
    p2Label.textContent = 'Player 2 (Arrows)';
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
    const code = e.code;

    // Player 1 (WASD)
    if (key === 'w') input.w = true;
    if (key === 'a') input.a = true;
    if (key === 's') input.s = true;
    if (key === 'd') input.d = true;

    // Player 2 (Arrow keys)
    if (code === 'ArrowUp') input.arrowUp = true;
    if (code === 'ArrowDown') input.arrowDown = true;
    if (code === 'ArrowLeft') input.arrowLeft = true;
    if (code === 'ArrowRight') input.arrowRight = true;
});

// Key up handler
window.addEventListener('keyup', (e) => {
    if (!spriteSelection.gameStarted) return;
    
    const key = e.key.toLowerCase();
    const code = e.code;

    // Player 1 (WASD)
    if (key === 'w') input.w = false;
    if (key === 'a') input.a = false;
    if (key === 's') input.s = false;
    if (key === 'd') input.d = false;

    // Player 2 (Arrow keys)
    if (code === 'ArrowUp') input.arrowUp = false;
    if (code === 'ArrowDown') input.arrowDown = false;
    if (code === 'ArrowLeft') input.arrowLeft = false;
    if (code === 'ArrowRight') input.arrowRight = false;
});
