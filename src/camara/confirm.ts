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
        // location.href = '/kiosk/camara.html';
    });

    downloadBtn?.addEventListener('click', async () => {
        const modal = document.getElementById('confirmationModal');

        // 모달 표시
        modal?.classList.add('show');

        // 3초 후 자동으로 모달 닫기
        setTimeout(() => {
            modal?.classList.remove('show');
        }, 3000);

        let phoneNumber = localStorage.getItem("phone");
        let name = localStorage.getItem("name");
        // 파일명
        let today = new Date();

        let dd = String(today.getDate()).padStart(2, '0'); // 시 분
        let mm = String(today.getMonth() + 1).padStart(2, '0'); // 월
        let yyyy = today.getFullYear(); // 년도

        let fileName = yyyy + '-' + mm + '-' + dd + '-' + phoneNumber + '-' + name;

        // 서버에 이미지 저장
        try {
            const response = await fetch('/api/save-photo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageData: dataUrl,
                    fileName: fileName
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('사진이 서버에 저장되었습니다:', result.filePath);
            } else {
                console.error('서버 저장 실패:', result.error);
            }
        } catch (error) {
            console.error('서버 통신 오류:', error);
        }

        // 클라이언트 다운로드도 유지
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${fileName}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        location.href = '/';
    });
}

document.addEventListener('DOMContentLoaded', main);