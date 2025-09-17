// utils/gradeClass.ts
export type GradeClassParts = {
  grade: number;   // 학년
  classNo: number; // 반
  number: number;  // 번호
  raw: string;     // 원본(숫자만)
  label: string;   // "1-1반 11번" 형태
};

/**
 * gradeClass 코드를 학년/반/번호로 분해 (기본 포맷: G CC NN = 5자리)
 * 예) 10111 -> { grade:1, classNo:1, number:11, label:"1-1반 11번" }
 */
export function parseGradeClass(code: string | number): GradeClassParts {
  const raw = String(code).replace(/\D/g, ''); // 숫자만
  if (!/^\d{5}$/.test(raw)) {
    throw new Error(`gradeClass 형식이 올바르지 않습니다(예: 10111). 받은 값: "${code}"`);
  }

  const grade = Number(raw.slice(0, 1));   // 1자리
  const classNo = Number(raw.slice(1, 3)); // 2자리
  const number = Number(raw.slice(3, 5));  // 2자리

  return {
    grade,
    classNo,
    number,
    raw,
    label: `${grade}-${classNo}반 ${number}번`,
  };
}
