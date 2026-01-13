// skins.js - simple skin selector wiring to terrain.setSkin()
document.addEventListener('DOMContentLoaded', () => {
    // Terrain controls
    const select = document.getElementById('skinSelect');
    const fileInput = document.getElementById('skinFile');
    const urlInput = document.getElementById('skinUrl');
    const applyBtn = document.getElementById('applySkinBtn');

    if (select && fileInput && urlInput && applyBtn) {
        select.addEventListener('change', () => {
            const v = select.value;
            terrain.setSkin(v || null);
        });

        applyBtn.addEventListener('click', () => {
            const v = urlInput.value.trim();
            if (!v) return;
            terrain.setSkin(v);
            select.value = '';
        });

        fileInput.addEventListener('change', () => {
            const file = fileInput.files && fileInput.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                terrain.setSkin(reader.result);
                select.value = '';
                urlInput.value = '';
            };
            reader.readAsDataURL(file);
        });
    }

    // Player 1 controls
    const p1Select = document.getElementById('p1SkinSelect');
    const p1File = document.getElementById('p1SkinFile');
    const p1Url = document.getElementById('p1SkinUrl');
    const p1Apply = document.getElementById('applyP1SkinBtn');

    if (p1Select && p1File && p1Url && p1Apply) {
        p1Select.addEventListener('change', () => {
            const v = p1Select.value;
            if (typeof player1 !== 'undefined') player1.setSkin(v || null);
        });
        p1Apply.addEventListener('click', () => {
            const v = p1Url.value.trim();
            if (!v) return;
            if (typeof player1 !== 'undefined') player1.setSkin(v);
            p1Select.value = '';
        });
        p1File.addEventListener('change', () => {
            const file = p1File.files && p1File.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof player1 !== 'undefined') player1.setSkin(reader.result);
                p1Select.value = '';
                p1Url.value = '';
            };
            reader.readAsDataURL(file);
        });
    }

    // Player 2 controls
    const p2Select = document.getElementById('p2SkinSelect');
    const p2File = document.getElementById('p2SkinFile');
    const p2Url = document.getElementById('p2SkinUrl');
    const p2Apply = document.getElementById('applyP2SkinBtn');

    if (p2Select && p2File && p2Url && p2Apply) {
        p2Select.addEventListener('change', () => {
            const v = p2Select.value;
            if (typeof player2 !== 'undefined') player2.setSkin(v || null);
        });
        p2Apply.addEventListener('click', () => {
            const v = p2Url.value.trim();
            if (!v) return;
            if (typeof player2 !== 'undefined') player2.setSkin(v);
            p2Select.value = '';
        });
        p2File.addEventListener('change', () => {
            const file = p2File.files && p2File.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof player2 !== 'undefined') player2.setSkin(reader.result);
                p2Select.value = '';
                p2Url.value = '';
            };
            reader.readAsDataURL(file);
        });
    }
});
