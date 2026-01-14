// Key Binds Manager
const keyBindsManager = {
    // Default key binds
    defaultBinds: {
        player1: {
            moveLeft: 'c',
            moveUp: 'f',
            moveRight: 'b',
            normalAttack: 'v',
            ability1: '1',
            ability2: '2',
            ability3: '3',
            ability4: '4'
        },
        player2: {
            moveLeft: 'arrowleft',
            moveUp: 'arrowup',
            moveRight: 'arrowright',
            normalAttack: '6',
            ability1: '7',
            ability2: '8',
            ability3: '9',
            ability4: '0'
        }
    },

    // Current key binds (loaded from storage or defaults)
    currentBinds: {},

    // Label mappings for display
    actionLabels: {
        moveLeft: 'Move Left',
        moveUp: 'Move Up',
        moveRight: 'Move Right',
        normalAttack: 'Normal Attack',
        ability1: 'Ability 1',
        ability2: 'Ability 2',
        ability3: 'Ability 3',
        ability4: 'Ability 4'
    },

    init() {
        // Load from localStorage or use defaults
        const saved = localStorage.getItem('pvpKeyBinds');
        if (saved) {
            try {
                this.currentBinds = JSON.parse(saved);
            } catch (e) {
                this.currentBinds = JSON.parse(JSON.stringify(this.defaultBinds));
            }
        } else {
            this.currentBinds = JSON.parse(JSON.stringify(this.defaultBinds));
        }
    },

    getKeyBind(player, action) {
        return this.currentBinds[player] && this.currentBinds[player][action] 
            ? this.currentBinds[player][action].toLowerCase() 
            : null;
    },

    setKeyBind(player, action, key) {
        if (!this.currentBinds[player]) {
            this.currentBinds[player] = {};
        }
        this.currentBinds[player][action] = key.toLowerCase();
        this.save();
    },

    save() {
        localStorage.setItem('pvpKeyBinds', JSON.stringify(this.currentBinds));
    },

    resetToDefaults() {
        this.currentBinds = JSON.parse(JSON.stringify(this.defaultBinds));
        this.save();
    },

    getBindsForPlayer(player) {
        return this.currentBinds[player] || this.defaultBinds[player];
    },

    getActionForKey(player, key) {
        const binds = this.getBindsForPlayer(player);
        for (let action in binds) {
            if (binds[action].toLowerCase() === key.toLowerCase()) {
                return action;
            }
        }
        return null;
    }
};

// UI Manager for key binds menu
const keyBindsUI = {
    modalOpen: false,
    currentlyBinding: null,
    listeningForKey: false,

    createModal() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'keyBindsOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;

        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'keyBindsModal';
        modal.style.cssText = `
            background: #222;
            color: white;
            padding: 30px;
            border-radius: 10px;
            width: 90%;
            max-width: 700px;
            max-height: 80vh;
            overflow-y: auto;
            border: 3px solid #FFD700;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.9);
        `;

        // Title
        const title = document.createElement('h2');
        title.textContent = 'Key Binds Settings';
        title.style.cssText = `
            margin-top: 0;
            margin-bottom: 30px;
            text-align: center;
            font-size: 28px;
            color: #FFD700;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
        `;
        modal.appendChild(title);

        // Player 1 section
        this.addPlayerSection(modal, 'player1', 'Player 1 Key Binds (Default: CFB + V)');

        // Player 2 section
        this.addPlayerSection(modal, 'player2', 'Player 2 Key Binds (Default: Arrow Keys)');

        // Buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            display: flex;
            gap: 10px;
            margin-top: 20px;
            justify-content: center;
            flex-wrap: wrap;
        `;

        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset to Defaults';
        resetBtn.style.cssText = `
            padding: 10px 20px;
            background: #ff6b6b;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: background 0.3s;
        `;
        resetBtn.onmouseover = () => resetBtn.style.background = '#ff5252';
        resetBtn.onmouseout = () => resetBtn.style.background = '#ff6b6b';
        resetBtn.onclick = () => this.confirmReset();
        buttonsContainer.appendChild(resetBtn);

        // Save button
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save & Close';
        saveBtn.style.cssText = `
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: background 0.3s;
        `;
        saveBtn.onmouseover = () => saveBtn.style.background = '#45a049';
        saveBtn.onmouseout = () => saveBtn.style.background = '#4CAF50';
        saveBtn.onclick = () => this.closeModal();
        buttonsContainer.appendChild(saveBtn);

        modal.appendChild(buttonsContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Close overlay when clicking outside modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal();
            }
        });
    },

    addPlayerSection(modal, player, title) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 30px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            border-left: 4px solid #FFD700;
        `;

        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = title;
        sectionTitle.style.cssText = `
            margin: 0 0 15px 0;
            color: #FFD700;
            font-size: 18px;
        `;
        section.appendChild(sectionTitle);

        const bindsList = document.createElement('div');
        bindsList.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;

        const actions = ['moveLeft', 'moveUp', 'moveRight', 'normalAttack', 'ability1', 'ability2', 'ability3', 'ability4'];
        
        for (const action of actions) {
            this.addBindRow(bindsList, player, action);
        }

        section.appendChild(bindsList);
        modal.appendChild(section);
    },

    addBindRow(container, player, action) {
        const row = document.createElement('div');
        row.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 5px;
            gap: 15px;
        `;

        const label = document.createElement('span');
        label.textContent = keyBindsManager.actionLabels[action];
        label.style.cssText = `
            min-width: 120px;
            color: #ddd;
        `;

        const bindButton = document.createElement('button');
        bindButton.id = `bind_${player}_${action}`;
        bindButton.textContent = keyBindsManager.getKeyBind(player, action).toUpperCase();
        bindButton.style.cssText = `
            padding: 8px 20px;
            background: #555;
            color: white;
            border: 2px solid #777;
            border-radius: 4px;
            cursor: pointer;
            min-width: 100px;
            font-weight: bold;
            transition: all 0.3s;
        `;

        bindButton.onmouseover = () => {
            if (!this.currentlyBinding || this.currentlyBinding !== `${player}_${action}`) {
                bindButton.style.background = '#666';
                bindButton.style.borderColor = '#FFD700';
            }
        };

        bindButton.onmouseout = () => {
            if (!this.currentlyBinding || this.currentlyBinding !== `${player}_${action}`) {
                bindButton.style.background = '#555';
                bindButton.style.borderColor = '#777';
            }
        };

        bindButton.onclick = () => this.startBinding(player, action, bindButton);

        row.appendChild(label);
        row.appendChild(bindButton);
        container.appendChild(row);
    },

    startBinding(player, action, buttonElement) {
        if (this.listeningForKey) return;

        this.currentlyBinding = `${player}_${action}`;
        this.listeningForKey = true;

        // Update button appearance
        buttonElement.textContent = 'Press any key...';
        buttonElement.style.background = '#FF9800';
        buttonElement.style.borderColor = '#FFD700';

        // Listen for key press
        const handleKeyPress = (e) => {
            e.preventDefault();
            e.stopPropagation();

            let keyName = e.key.toLowerCase();

            // Handle special keys
            if (keyName === 'arrowup' || keyName === 'arrowdown' || keyName === 'arrowleft' || keyName === 'arrowright') {
                keyName = e.key.toLowerCase();
            } else if (keyName === 'escape') {
                // Cancel binding
                buttonElement.textContent = keyBindsManager.getKeyBind(player, action).toUpperCase();
                buttonElement.style.background = '#555';
                buttonElement.style.borderColor = '#777';
                window.removeEventListener('keydown', handleKeyPress);
                this.listeningForKey = false;
                this.currentlyBinding = null;
                return;
            } else if (keyName === ' ') {
                keyName = 'space';
            }

            // Set the new key bind
            keyBindsManager.setKeyBind(player, action, keyName);

            // Update button
            buttonElement.textContent = keyName.toUpperCase();
            buttonElement.style.background = '#4CAF50';
            buttonElement.style.borderColor = '#45a049';

            // Remove listener
            window.removeEventListener('keydown', handleKeyPress);
            this.listeningForKey = false;
            this.currentlyBinding = null;

            // Reset button after a moment
            setTimeout(() => {
                buttonElement.style.background = '#555';
                buttonElement.style.borderColor = '#777';
            }, 300);
        };

        window.addEventListener('keydown', handleKeyPress);
    },

    confirmReset() {
        if (confirm('Are you sure you want to reset all key binds to defaults?')) {
            keyBindsManager.resetToDefaults();
            // Refresh the modal
            this.closeModal();
            setTimeout(() => this.openModal(), 100);
        }
    },

    openModal() {
        const overlay = document.getElementById('keyBindsOverlay');
        if (!overlay) {
            this.createModal();
        }
        document.getElementById('keyBindsOverlay').style.display = 'flex';
        this.modalOpen = true;
    },

    closeModal() {
        const overlay = document.getElementById('keyBindsOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        this.modalOpen = false;
    },

    toggleModal() {
        if (this.modalOpen) {
            this.closeModal();
        } else {
            this.openModal();
        }
    }
};

// Initialize key binds manager on page load
window.addEventListener('DOMContentLoaded', () => {
    keyBindsManager.init();
    keyBindsUI.createModal();
});
