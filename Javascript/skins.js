// skins.js - simple skin selector wiring to terrain.setSkin()
document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('skinSelect');
    const fileInput = document.getElementById('skinFile');
    const urlInput = document.getElementById('skinUrl');
    const applyBtn = document.getElementById('applySkinBtn');

    if (!select || !fileInput || !urlInput || !applyBtn) return;

    select.addEventListener('change', () => {
        const v = select.value;
        if (!v) {
            terrain.setSkin(null);
        } else {
            terrain.setSkin(v);
        }
    });

    applyBtn.addEventListener('click', () => {
        const v = urlInput.value.trim();
        if (!v) return;
        terrain.setSkin(v);
        // clear select
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
});
