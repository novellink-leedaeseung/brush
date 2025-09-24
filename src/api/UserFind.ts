import {getAuthUser, getKioskAuth} from "@/api/ApiAxios.ts";
import type {AuthUserResponse} from "@/api/Response.ts";
import { getConfig } from "@/hooks/useConfig";
import axios from "axios";

// 서버 조회
// 1. 키오스크 토큰 가져오기
// 2. inputField에 전화번호로 조회하기
export async function findUser(inputField: string): Promise<AuthUserResponse> {

    localStorage.removeItem("name");
    localStorage.removeItem("gender");
    localStorage.removeItem("phone");

    const isPhone = /^010\d{8}$/.test(inputField);
    const type: "PHONE" | "ID" = isPhone ? "PHONE" : "ID";
    const { kioskId } = await getConfig();

    // 1) 키오스크 인증 → 토큰 획득
    const kioskAuth = await getKioskAuth(kioskId ?? "");
    const kioskToken = kioskAuth.resultData?.token;
    if (!kioskToken) {
        // 이 경우는 보통 네트워크 문제나 서버의 심각한 오류
        throw new Error("키오스크 인증 토큰을 받을 수 없습니다.");
    }

    // 2) 사용자 인증
    // getAuthUser에서 404가 발생하면 AxiosError가 throw됨
    const res = await getAuthUser(inputField, type, kioskToken);
    console.log("사용자 인증 결과:", res);

    // 3) 인증 성공 후 데이터 확인
    const user = res?.resultData;
    if (user?.username) {
        localStorage.setItem("name", user.username);
        if (user.gender) localStorage.setItem("gender", user.gender);
        if (user.phonenumber) localStorage.setItem("phone", user.phonenumber);
    } else {
        // API 호출은 성공했으나, 데이터가 없는 경우 (논리적으로는 404와 유사)
        const notFoundError = new Error("User not found in response data");
        notFoundError.name = "UserNotFoundError"; // UI에서 구분하기 위한 이름
        throw notFoundError;
    }

    return res;
}