# Key Binds Settings Feature

## Overview
A complete key binds customization system has been added to PVP Ultimata, allowing players to configure their controls before starting the game.

## Features Implemented

### 1. Key Binds Manager (`Javascript/keybinds.js`)
- **Configuration System**: Stores and manages key binds for both players
- **Persistent Storage**: Uses browser localStorage to save custom key binds
- **Default Binds**: 
  - Player 1: C/F/B for movement, V for normal attack, 1-4 for abilities
  - Player 2: Arrow Keys for movement, 6 for normal attack, 7-0 for abilities
- **Reset Functionality**: One-click reset to default key binds

### 2. Key Binds UI Modal
A beautiful, user-friendly modal interface featuring:
- Separate sections for Player 1 and Player 2
- All 8 actions per player are customizable:
  - Move Left
  - Move Up
  - Move Right
  - Normal Attack
  - Ability 1
  - Ability 2
  - Ability 3
  - Ability 4
- Interactive key binding process - simply click a button and press the desired key
- "Press any key..." feedback while waiting for input
- Press ESC to cancel key binding
- Reset to Defaults button
- Save & Close button

### 3. Menu Integration
- **Key Binds Settings Button**: Added to the main menu (sprite selection screen)
- **Button Styling**: Gold-colored button (⚙️ Key Binds Settings) with hover effects
- **Accessibility**: Can be accessed before starting the game

### 4. Dynamic Key Bind Support
- **Updated Input Handler**: `Javascript/input.js` now reads from the key binds manager instead of hardcoded keys
- **Dynamic Info Display**: On-screen info updates to show current key binds for both players
- **Real-time Updating**: Key binds changes take effect immediately

## Files Modified

### New Files:
- `Javascript/keybinds.js` - Complete key binds management system (250+ lines)

### Modified Files:
- `index.html` - Added key binds button to menu, imported keybinds.js script
- `Javascript/input.js` - Updated key handlers to use key binds manager, added button event listeners
- `styles.css` - Added styling for key binds menu button

## How to Use

### As a Player:
1. Open the game
2. In the sprite selection menu, click the **⚙️ Key Binds Settings** button
3. Select a key binding by clicking on any button (e.g., "MOVEUP", "ABILITY1")
4. Press the desired key (press ESC to cancel)
5. The button will update with the new key
6. Click **Save & Close** when finished (changes auto-save)
7. Optionally click **Reset to Defaults** to restore original bindings

### As a Developer:
- Access the key binds manager: `keyBindsManager`
- Get a key bind: `keyBindsManager.getKeyBind('player1', 'moveLeft')`
- Set a key bind: `keyBindsManager.setKeyBind('player1', 'moveLeft', 'a')`
- Reset all: `keyBindsManager.resetToDefaults()`
- Open/Close modal: `keyBindsUI.openModal()` / `keyBindsUI.closeModal()`

## Storage Details
- Key binds are stored in `localStorage` under the key `'pvpKeyBinds'`
- Automatically loads on page refresh
- JSON format for easy debugging

## Customization Examples

### Change Default Key Binds
Edit `keybinds.js`, in the `defaultBinds` object:
```javascript
defaultBinds: {
    player1: {
        moveLeft: 'a',      // Change to 'a'
        moveUp: 'w',        // Change to 'w'
        // ...
    }
}
```

### Add More Actions
1. Add to `defaultBinds` object
2. Add to `actionLabels` object with a display name
3. Add to the `actions` array in `addPlayerSection()` method
4. Update input handlers in `input.js`

## Browser Compatibility
- Works on all modern browsers that support ES6 and localStorage
- Tested on Chrome, Firefox, Edge, Safari

## Known Features
✅ Customizable key binds for both players
✅ Persistent storage (survives page refresh)
✅ Beautiful modal UI with visual feedback
✅ Real-time key binding process
✅ Reset to defaults option
✅ Dynamic info display of current binds
✅ ESC to cancel key binding
✅ Full keyboard support (including arrow keys, special keys, etc.)

## Future Enhancement Ideas
- Preset profiles (e.g., "WASD Player 2", "Controller Config")
- Key bind conflict detection
- Import/Export key binds as JSON
- Key bind history/undo
- Difficulty-specific key binds
