import { getKioskAuth } from "./api/ApiAxios";

type StatusType = "info" | "success" | "error";

const kioskAuth = {
    "status" : document.getElementById("kiosk-auth-status") as HTMLDivElement | null,
    "output" : document.getElementById("kiosk-auth-output") as HTMLPreElement | null,
    "btn-fetch": document.getElementById("kiosk-auth-btn-fetch") as HTMLButtonElement | null,
    "user-id": document.getElementById("kiosk-auth-user-id") as HTMLInputElement | null,
};

function setStatus(type: StatusType, text: string) {
  if (!kioskAuth.status) return;
  kioskAuth.status.dataset.type = type;
  kioskAuth.status.textContent = text;
}


async function loadUsers() {
  setStatus("info", "사용자 목록 불러오는 중…");
  try {
    const users = await getKioskAuth(kioskAuth["user-id"]?.value ?? "");
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
  void loadUsers();
});