import axios from "axios";
import type {AuthKioskResponse, AuthUserResponse} from "./Response";

const api = axios.create({
    baseURL: "/api",
    timeout: 15000,
});

// auth-kiosk 가져오기
export async function getKioskAuth(kioskName :string): Promise<AuthKioskResponse> {
    const res = await api.post<AuthKioskResponse>("/auth-kiosk", {
        "kioskid": `${kioskName}`,
    });

    return res.data;
}

// auth-user 조회
export async function getAuthUser(userId :string, type :string, token :string): Promise<AuthUserResponse> {
    const res = await api.post<AuthUserResponse>("/auth-user", {
        "userid": `${userId}`,
        "type": `${type? type : "phone"}`,
        "token": `${token}`,
    });

    return res.data;
}

