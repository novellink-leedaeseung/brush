import { getUsers, type UserResponse } from "./api/ApiAxios";

type StatusType = "info" | "success" | "error";

const statusEl = document.getElementById("status") as HTMLDivElement | null;
const outputEl = document.getElementById("output") as HTMLPreElement | null;
const btnFetch = document.getElementById("btn-fetch") as HTMLButtonElement | null;

function setStatus(type: StatusType, text: string) {
  if (!statusEl) return;
  statusEl.dataset.type = type;
  statusEl.textContent = text;
}

function renderUsers(users: UserResponse[]) {
  if (!outputEl) return;
  outputEl.textContent = JSON.stringify(users, null, 2);
}

async function loadUsers() {
  setStatus("info", "사용자 목록 불러오는 중…");
  try {
    const users = await getUsers();
    renderUsers(users);
    setStatus("success", `불러오기 완료 (${users.length}명)`);
  } catch (err: any) {
    console.error(err);
    setStatus("error", "불러오기에 실패했습니다.");
    if (outputEl) outputEl.textContent = "오류가 발생했습니다. 콘솔을 확인하세요.";
  }
}

btnFetch?.addEventListener("click", () => {
  void loadUsers();
});

// 초기 로드시 한 번 불러오기
void loadUsers();