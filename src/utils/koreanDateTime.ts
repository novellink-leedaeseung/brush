// utils/koreanDateTime.ts
// 이 유틸은 다음 두 가지 입력을 모두 안전하게 파싱합니다.
// 1) "2025. 9. 17. 오후 6:52:14" (ko-KR 스타일)
// 2) "2025-9-24 9:50:56 AM"      (API 영문 AM/PM 스타일)
// 출력은 기존 타입과 동일하며, 24시간제 및 ISO-날짜 문자열을 제공합니다.

export type ParsedKoKRDateTime = {
  dateRaw: string;   // "2025. 9. 17."
  timeRaw: string;   // "오후 6:52:14"
  dateISO: string;   // "2025-09-17"
  time24: string;    // "18:52:14"
};

function pad2(n: number) { return n.toString().padStart(2, '0'); }

/**
 * 주어진 문자열을 'Asia/Seoul' 기준의 시·분·초로 해석해 24시간제로 반환합니다.
 * 입력 예:
 *   - "2025. 9. 17. 오후 6:52:14"
 *   - "2025-9-24 9:50:56 AM"
 */
export function splitKoKRDateTime(input: string): ParsedKoKRDateTime {
  const s = String(input ?? '').trim();

  // 1) ko-KR 포맷: 2025. 9. 17. 오후 6:52:14
  const reKo = /^\s*(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(오전|오후)\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/;

  // 2) 영문 AM/PM 포맷: 2025-9-24 9:50:56 AM  (초가 없을 수도 있음)
  const reEn = /^\s*(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)\s*$/i;

  let year: number, month: number, day: number;
  let hour12: number, minute: number, second: number;
  let periodKo: '오전' | '오후';

  let m = s.match(reKo);
  if (m) {
    year = parseInt(m[1], 10);
    month = parseInt(m[2], 10);
    day = parseInt(m[3], 10);
    periodKo = (m[4] as '오전' | '오후');
    hour12 = parseInt(m[5], 10);
    minute = parseInt(m[6], 10);
    second = m[7] ? parseInt(m[7], 10) : 0;
  } else {
    const me = s.match(reEn);
    if (!me) {
      throw new Error('Unsupported datetime format: ' + s);
    }
    year = parseInt(me[1], 10);
    month = parseInt(me[2], 10);
    day = parseInt(me[3], 10);
    const ap = (me[7] || '').toUpperCase(); // AM/PM
    periodKo = ap === 'PM' ? '오후' : '오전';
    hour12 = parseInt(me[4], 10);
    minute = parseInt(me[5], 10);
    second = me[6] ? parseInt(me[6], 10) : 0;
  }

  // 24시간 변환 (12시는 0으로)
  let hour24 = hour12 % 12;
  if (periodKo === '오후') hour24 += 12;

  return {
    dateRaw: `${year}. ${month}. ${day}.`,
    timeRaw: `${periodKo} ${hour12}:${pad2(minute)}:${pad2(second)}`,
    dateISO: `${year}-${pad2(month)}-${pad2(day)}`,
    time24: `${pad2(hour24)}:${pad2(minute)}:${pad2(second)}`
  };
}

/**
 * Date 객체가 필요하면 이 함수를 사용하세요.
 * 입력 문자열을 Asia/Seoul 기준 로컬시각으로 해석하여 UTC 타임스탬프(Date)로 변환합니다.
 */
export function parseToKSTDate(input: string): Date {
  const p = splitKoKRDateTime(input);
  const [y, m, d] = p.dateISO.split('-').map((x) => parseInt(x, 10));
  const [h, mi, s] = p.time24.split(':').map((x) => parseInt(x, 10));
  // KST(UTC+9) → UTC 보정: 시간에서 9시간 빼서 Date.UTC 생성
  const utcMs = Date.UTC(y, (m - 1), d, h - 9, mi, s);
  return new Date(utcMs);
}

/**
 * 저장/전송용으로 KST 오프셋을 포함한 ISO 문자열이 필요할 때:
 *  ex) "2025-09-24T09:50:56+09:00"
 */
export function toKSTISOWithOffset(input: string): string {
  const p = splitKoKRDateTime(input);
  return `${p.dateISO}T${p.time24}+09:00`;
}

/**
 * 화면표시용(ko-KR, KST 고정) 문자열이 필요할 때:
 *  ex) "2025. 09. 24. 09:50:56"
 */
export function toKSTDisplay(input: string): string {
  const d = parseToKSTDate(input);
  const f = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
  return f.format(d);
}
