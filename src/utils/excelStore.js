import path from "path";
import fs from "fs-extra";
import ExcelJS from "exceljs";
import { Mutex } from "async-mutex";

const mutex = new Mutex();
const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "members.xlsx");
const BACKUP_PATH = path.join(DATA_DIR, "members_backup.xlsx");
const SHEET_NAME = "Members";

// 파일 백업 생성
async function createBackup() {
  if (await fs.pathExists(FILE_PATH)) {
    await fs.copy(FILE_PATH, BACKUP_PATH);
  }
}

// 워크북 로드/생성
async function ensureWorkbook() {
  await fs.ensureDir(DATA_DIR);
  const wb = new ExcelJS.Workbook();

  if (await fs.pathExists(FILE_PATH)) {
    await wb.xlsx.readFile(FILE_PATH);
  }

  // 시트 없으면 새로 만들기 + 헤더 정의
  let ws = wb.getWorksheet(SHEET_NAME);
  if (!ws) {
    ws = wb.addWorksheet(SHEET_NAME);
    ws.columns = [
      { header: "timestamp", key: "timestamp", width: 22 },
      { header: "name", key: "name", width: 16 },
      { header: "phone", key: "phone", width: 16 },
      { header: "gradeClass", key: "gradeClass", width: 12 },
      { header: "gender", key: "gender", width: 8 },
    ];
  }

  return wb;
}

// 학생 데이터 한 줄 추가
export async function appendMemberToExcel(row) {
  return mutex.runExclusive(async () => {
    try {
      await createBackup();
      
      const wb = await ensureWorkbook();
      const ws = wb.getWorksheet(SHEET_NAME);
      
      const newRowData = {
        timestamp: new Date().toISOString(),
        name: row.name ?? "",
        phone: row.phone ?? "",
        gradeClass: row.gradeClass ?? "",
        gender: row.gender ?? "",
      };
      
      // 직접 셀에 값 설정
      const nextRowIndex = ws.actualRowCount + 1;
      ws.getCell(`A${nextRowIndex}`).value = newRowData.timestamp;
      ws.getCell(`B${nextRowIndex}`).value = newRowData.name;
      ws.getCell(`C${nextRowIndex}`).value = newRowData.phone;
      ws.getCell(`D${nextRowIndex}`).value = newRowData.gradeClass;
      ws.getCell(`E${nextRowIndex}`).value = newRowData.gender;

      // 임시 파일로 저장 후 이동
      const tempPath = path.join(DATA_DIR, 'members_temp.xlsx');
      await wb.xlsx.writeFile(tempPath);
      await fs.move(tempPath, FILE_PATH, { overwrite: true });

      return { filePath: FILE_PATH, sheet: SHEET_NAME };
      
    } catch (error) {
      // 에러 발생 시 백업에서 복원
      if (await fs.pathExists(BACKUP_PATH)) {
        await fs.copy(BACKUP_PATH, FILE_PATH, { overwrite: true });
      }
      throw error;
    }
  });
}
