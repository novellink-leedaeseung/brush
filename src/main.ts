import { getKioskAuth } from "./api/ApiAxios";

type StatusType = "info" | "success" | "error";

const statusEl = document.getElementById("status") as HTMLDivElement | null;
const outputEl = document.getElementById("output") as HTMLPreElement | null;
const btnFetch = document.getElementById("btn-fetch") as HTMLButtonElement | null;
const userId = document.getElementById("user-id") as HTMLInputElement | null;

function setStatus(type: StatusType, text: string) {
  if (!statusEl) return;
  statusEl.dataset.type = type;
  statusEl.textContent = text;
}


async function loadUsers() {
  setStatus("info", "사용자 목록 불러오는 중…");
  try {
    const users = await getKioskAuth(userId?.value ?? "");
    setStatus("success", `불러오기 완료 (${users.resultData.token}명)`);
  } catch (err: any) {
    console.error(err);
    setStatus("error", "불러오기에 실패했습니다.");
    if (outputEl) outputEl.textContent = "오류가 발생했습니다. 콘솔을 확인하세요.";
  }
}

btnFetch?.addEventListener("click", () => {
  void loadUsers();
});