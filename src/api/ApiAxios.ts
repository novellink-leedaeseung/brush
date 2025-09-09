import axios from "axios";

export interface UserResponse {
    resultCode: string;
    resultData: [
        token: String,
    ]
}

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

export async function getUsers(): Promise<UserResponse[]> {
    const res = await api.post<UserResponse[]>("/auth-kiosk", {
      "kioskid":"MTA001",
    });
    return res.data;
}