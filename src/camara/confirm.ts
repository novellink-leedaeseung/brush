// src/camera/confirm.ts
const CAPTURED_PHOTO_KEY = 'camara.capturedPhoto';

function main() {
    const img = document.getElementById('capturedImg') as HTMLImageElement | null;
    const dataUrl = sessionStorage.getItem(CAPTURED_PHOTO_KEY);

    if (!img || !dataUrl) {
        // 저장된 이미지가 없으면 촬영 페이지로 되돌림
        location.replace('/kiosk/camara.html');
        return;
    }

    img.src = dataUrl;

    const retakeBtn = document.getElementById('retakeBtn') as HTMLButtonElement | null;
    const downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement | null;

    retakeBtn?.addEventListener('click', () => {
        sessionStorage.removeItem(CAPTURED_PHOTO_KEY);
        location.href = '/kiosk/camara.html';
    });

    downloadBtn?.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `photo-${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    });
}

document.addEventListener('DOMContentLoaded', main);