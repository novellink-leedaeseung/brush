// utils/koreanDateTime.ts
export type ParsedKoKRDateTime = {
  dateRaw: string;   // "2025. 9. 17."
  timeRaw: string;   // "오후 6:52:14"
  dateISO: string;   // "2025-09-17"
  time24: string;    // "18:52:14"
};

export function splitKoKRDateTime(input: string): ParsedKoKRDateTime {
  const s = String(input).trim();

  // 예: "2025. 9. 17. 오후 6:52:14"
  const re =
    /^\s*(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(오전|오후)\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/;

  const m = s.match(re);
  if (!m) {
    throw new Error(`ko-KR 날짜/시간 형식이 아닙니다: "${input}"`);
  }

  const [, y, mo, d, period, h, mi, secOpt] = m;
  const year = Number(y);
  const month = Number(mo);
  const day = Number(d);
  const hour12 = Number(h);
  const minute = Number(mi);
  const second = secOpt ? Number(secOpt) : 0;

  // 24시간 변환
  let hour24 = hour12 % 12; // 12시는 0으로
  if (period === '오후') hour24 += 12;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return {
    dateRaw: `${year}. ${month}. ${day}.`,
    timeRaw: `${period} ${hour12}:${pad(minute)}:${pad(second)}`,
    dateISO: `${year}-${pad(month)}-${pad(day)}`,
    time24: `${pad(hour24)}:${pad(minute)}:${pad(second)}`
  };
}
