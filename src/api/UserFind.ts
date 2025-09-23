import {getAuthUser, getKioskAuth} from "@/api/ApiAxios.ts";
import type {AuthUserResponse} from "@/api/Response.ts";
import {config} from '@/config.ts';

// 서버 조회
// 1. 키오스크 토큰 가져오기
// 2. inputField에 전화번호로 조회하기
export async function findUser(inputField: string): Promise<AuthUserResponse | null> {

  // localStorage.clear(); // 전부 지우기보다 필요한 키만 지우는 게 안전
  localStorage.removeItem("name");
  localStorage.removeItem("gender");
  localStorage.removeItem("phone");

  // 핸드폰/아이디 구분 (010으로 시작 + 총 11자리)
  const isPhone = /^010\d{8}$/.test(inputField);
  const type: "PHONE" | "ID" = isPhone ? "PHONE" : "ID";

  try {
    // 1) 키오스크 인증 → 토큰 획득
    const kioskAuth = await getKioskAuth(config.kioskId ?? "");
    const kioskToken = kioskAuth.resultData?.token;
    if (!kioskToken) throw new Error("키오스크 토큰 없음");

    // 2) 사용자 인증
    const res = await getAuthUser(inputField, type, kioskToken);
    console.log("사용자 인증 결과:", res);

    // 3) 인증 성공 후 처리 (필드 존재 여부 방어코드)
    const user = res?.resultData;
    if (user?.username) {
      localStorage.setItem("name", user.username);
      if (user.gender) localStorage.setItem("gender", user.gender);
      if (user.phonenumber) localStorage.setItem("phone", user.phonenumber);
    } else {
        throw new Error("사용자 정보가 없습니다.");
    }

    return res; // ✅ 이제 비동기 완료 후 값을 반환
  } catch (error) {
    console.error("에러 발생:", error);
    return null; // 실패 시 null 반환 (호출부에서 체크)
  }
}
