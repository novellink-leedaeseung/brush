import {getAuthUser, getKioskAuth} from "./api/ApiAxios";

type StatusType = "info" | "success" | "error";

const kioskAuth = {
    "status" : document.getElementById("kiosk-auth-status") as HTMLDivElement | null,
    "output" : document.getElementById("kiosk-auth-output") as HTMLPreElement | null,
    "btn-fetch": document.getElementById("kiosk-auth-btn-fetch") as HTMLButtonElement | null,
    "kiosk-id": document.getElementById("kiosk-auth-kiosk-id") as HTMLInputElement | null,
};
const authUser = {
    "status" : document.getElementById("auth-user-status") as HTMLDivElement | null,
    "output" : document.getElementById("auth-user-output") as HTMLPreElement | null,
    "btn-fetch": document.getElementById("auth-user-btn-fetch") as HTMLButtonElement | null,
    "kiosk-id": document.getElementById("auth-user-kiosk-id") as HTMLInputElement | null,
    "user-id": document.getElementById("auth-user-id") as HTMLInputElement | null,
};

function setStatus(type: StatusType, text: string) {
  if (!kioskAuth.status) return;
  kioskAuth.status.dataset.type = type;
  kioskAuth.status.textContent = text;
}

// 키오스크 auth
async function kioskAuthFun() {
  setStatus("info", "사용자 목록 불러오는 중…");
  try {
    const users = await getKioskAuth(kioskAuth["kiosk-id"]?.value ?? "");
    setStatus("success", `불러오기 완료`);
    if (kioskAuth["output"]) {
      kioskAuth["output"].textContent = `${users.resultCode} - Token: ${users.resultData.token}`;
    }

  } catch (err: any) {
    console.error(err);
    setStatus("error", "불러오기에 실패했습니다.");
    if (kioskAuth.output) kioskAuth.output.textContent = "오류가 발생했습니다. 콘솔을 확인하세요.";
  }
}

kioskAuth["btn-fetch"]?.addEventListener("click", () => {
  void kioskAuthFun();
});

// 사용자 정보 가져오기
async function userAuthFun() {
  try {
    const users = await getAuthUser(authUser["user-id"]?.value ?? "", "PHONE", authUser["kiosk-id"]?.value ?? "");
    if (authUser["output"]) {
      authUser["output"].textContent = `${users.resultCode} - 성별: ${users.resultData.gender}`;
    }

  } catch (err: any) {
    console.error(err);
    setStatus("error", "불러오기에 실패했습니다.");
    if (authUser.output) authUser.output.textContent = "오류가 발생했습니다. 콘솔을 확인하세요.";
  }
}
authUser["btn-fetch"]?.addEventListener("click", () => {
  void userAuthFun();
});
