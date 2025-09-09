import axios from "axios";
import type {AuthKioskResponse} from "./Response";

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

