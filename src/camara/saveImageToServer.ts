// CameraConfirmPage에서 사용할 서버 이미지 저장 함수

/**
 * 서버에 이미지를 저장하는 함수
 * @param {string} imageDataUrl - Base64 형태의 이미지 데이터 (data:image/jpeg;base64,...)
 * @param {Object} userInfo - 사용자 정보 객체 (선택사항)
 * @returns {Promise<Object>} - 서버 응답 결과
 */
const saveImageToServer = async (imageDataUrl, userInfo = {}) => {
    try {
        // ============ 파일명 생성 부분 (수정 가능) ============
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const seconds = String(today.getSeconds()).padStart(2, '0');

        // 사용자 정보에서 파일명에 포함할 데이터 추출
        const phoneNumber = userInfo.phone || localStorage.getItem("phone") || "unknown";
        const userName = userInfo.name || localStorage.getItem("name") || "user";

        // 파일명 형식: YYYY-MM-DD-HH-MM-SS-전화번호-이름
        // 필요에 따라 이 부분을 수정하세요
        const fileName = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${phoneNumber}-${userName}`;

        // 또는 다른 형식 예시들:
        // const fileName = `photo_${year}${month}${day}_${phoneNumber}`;
        // const fileName = `${userName}_${year}-${month}-${day}_${Date.now()}`;
        // const fileName = `student_photo_${phoneNumber}_${year}${month}${day}${hours}${minutes}`;
        // ====================================================

        console.log('📸 이미지 저장 시작:', fileName);

        // 서버 API 호출
        const response = await fetch('/api/save-photo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageData: imageDataUrl,
                fileName: fileName
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log('✅ 이미지 저장 성공:', result);
            return {
                success: true,
                message: result.message,
                fileName: result.fileName,
                filePath: result.filePath,
                timestamp: result.timestamp
            };
        } else {
            console.error('❌ 서버 응답 오류:', result);
            throw new Error(result.error || '이미지 저장에 실패했습니다.');
        }

    } catch (error) {
        console.error('❌ 이미지 저장 실패:', error);
        throw error;
    }
};

// 사용 예시 함수
const handleRegisterButtonClick = async () => {
    try {
        // 캡처된 이미지 데이터 가져오기 (세션 스토리지에서)
        const CAPTURED_PHOTO_KEY = 'camara.capturedPhoto';
        const imageDataUrl = sessionStorage.getItem(CAPTURED_PHOTO_KEY);

        if (!imageDataUrl) {
            alert('저장할 이미지가 없습니다. 다시 촬영해주세요.');
            return;
        }

        // 로딩 상태 표시
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.disabled = true;
            registerBtn.textContent = '저장 중...';
        }

        // 서버에 이미지 저장
        const result = await saveImageToServer(imageDataUrl);

        // 성공 시 처리
        alert(`이미지가 성공적으로 저장되었습니다!\n파일명: ${result.fileName}`);

        // 세션 스토리지 정리
        sessionStorage.removeItem(CAPTURED_PHOTO_KEY);

        // 홈 페이지로 이동
        window.location.href = '/';

    } catch (error) {
        // 에러 처리
        alert(`이미지 저장 실패: ${error.message}`);
        console.error('Registration failed:', error);
    } finally {
        // 버튼 상태 복원
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.disabled = false;
            registerBtn.textContent = '등록';
        }
    }
};

// 추가적인 유틸리티 함수들

/**
 * 파일명에서 특수문자 제거하는 함수
 * @param {string} filename - 원본 파일명
 * @returns {string} - 안전한 파일명
 */
const sanitizeFileName = (filename) => {
    return filename.replace(/[^a-zA-Z0-9가-힣\-_]/g, '');
};

/**
 * 사용자 정의 파일명 생성 함수 예시
 * @param {Object} options - 파일명 생성 옵션
 * @returns {string} - 생성된 파일명
 */
const generateCustomFileName = (options = {}) => {
    const {
        prefix = 'photo',
        includeTime = true,
        includeUserInfo = true,
        format = 'YYYYMMDD'
    } = options;

    const now = new Date();
    let fileName = prefix;

    // 날짜 형식에 따른 처리
    if (format === 'YYYYMMDD') {
        const dateStr = now.getFullYear() +
                       String(now.getMonth() + 1).padStart(2, '0') +
                       String(now.getDate()).padStart(2, '0');
        fileName += '_' + dateStr;
    } else if (format === 'YYYY-MM-DD') {
        const dateStr = now.getFullYear() + '-' +
                       String(now.getMonth() + 1).padStart(2, '0') + '-' +
                       String(now.getDate()).padStart(2, '0');
        fileName += '_' + dateStr;
    }

    // 시간 포함
    if (includeTime) {
        const timeStr = String(now.getHours()).padStart(2, '0') +
                       String(now.getMinutes()).padStart(2, '0') +
                       String(now.getSeconds()).padStart(2, '0');
        fileName += '_' + timeStr;
    }

    // 사용자 정보 포함
    if (includeUserInfo) {
        const phone = localStorage.getItem("phone");
        const name = localStorage.getItem("name");
        if (phone) fileName += '_' + phone;
        if (name) fileName += '_' + name;
    }

    return sanitizeFileName(fileName);
};

// HTML에서 사용할 때:
// <button id="registerBtn" onclick="handleRegisterButtonClick()">등록</button>

// React 컴포넌트에서 사용할 때:
/*
const CameraConfirmPage = () => {
    const handleRegister = async () => {
        await handleRegisterButtonClick();
    };

    return (
        <div>
            <button onClick={handleRegister}>등록</button>
        </div>
    );
};
*/