import {getAuthUser, getKioskAuth} from "../api/ApiAxios.ts";

const confirmButton = document.getElementById('confirm-button') as HTMLButtonElement;
const inputField = document.getElementById('input-field') as HTMLInputElement;

confirmButton.addEventListener('click', () => {
    findUser(String(inputField.textContent));
});

// 서버 조회
// 1. 키오스크 토큰 가져오기
// 2. inputField에 전화번호로 조회하기
export function findUser(inputField: string) {
    localStorage.clear();
    // 핸드폰, 회원 아이디 구분
    let type = "PHONE";
    if (inputField.length !== 11 && inputField.indexOf("010", 0) !== 0) {
        type = "ID";
    }

    // 키오스크 인증 후 사용자 인증
    getKioskAuth("MTA001")
        .then(res => {
            const kioskToken = res.resultData.token;
            // kioskToken을 받은 후 사용자 인증 실행
            return getAuthUser(inputField, type, kioskToken);
        })
        .then(res => {
            console.log('사용자 인증 결과:', res);
            // 여기서 인증 성공 후 처리
            localStorage.setItem("name", res.resultData.username);
            localStorage.setItem("gender", res.resultData.gender);
            localStorage.setItem("phone", res.resultData.phonenumber);
            window.location.href = "/kiosk/user-confirm.html";
        })
        .catch(error => {
            console.error('에러 발생:', error);
            // 에러 처리
        });

}