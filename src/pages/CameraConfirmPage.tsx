import { useMemo, useState } from "react";
import { useCamera } from "../hooks/useCamera";

type Props = {
  title?: string;                    // 상단 타이틀
  onConfirm?: (savedPath: string) => void; // 저장 완료 콜백
  onCancel?: () => void;
};

export default function CameraConfirmPage({ title = "사용자 확인", onConfirm, onCancel }: Props) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const {
    videoRef,
    canvasRef,
    state,
    capture,
  } = useCamera({
    onError: (e) => setMessage(e instanceof Error ? e.message : String(e)),
  });

  const styles = useMemo(() => ({
    root: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column" as const,
      background: "#F9FAFB",
      fontFamily: "Pretendard, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      color: "#111",
    },
    header: {
      padding: "16px 20px",
      fontSize: 24,
      fontWeight: 700,
      lineHeight: "32px",
      borderBottom: "1px solid #E5E7EB",
    },
    body: {
      flex: 1,
      display: "grid",
      gridTemplateColumns: "1fr 320px",
      gap: 24,
      padding: 20,
      alignItems: "stretch",
      minHeight: 0,
    },
    videoWrap: {
      position: "relative" as const,
      borderRadius: 16,
      overflow: "hidden",
      background: "#000",
    },
    videoEl: {
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
      display: "block",
    },
    overlayBox: (x: number, y: number, w: number, h: number) => ({
      position: "absolute" as const,
      left: `${x * 100}%`,
      top: `${y * 100}%`,
      width: `${w * 100}%`,
      height: `${h * 100}%`,
      border: "3px solid #22A6EF",
      borderRadius: 12,
      boxShadow: "0 0 8px rgba(34,166,239,0.6) inset",
      pointerEvents: "none" as const,
    }),
    side: {
      display: "flex",
      flexDirection: "column" as const,
      gap: 12,
    },
    card: {
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 16,
      padding: 16,
    },
    btnRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginTop: 8,
    },
    btn: {
      height: 44,
      borderRadius: 12,
      border: "1px solid #D1D5DB",
      background: "#fff",
      cursor: "pointer",
      fontSize: 16,
      fontWeight: 600,
    },
    btnPrimary: {
      height: 44,
      borderRadius: 12,
      border: "1px solid #227EFF",
      background: "#227EFF",
      color: "#fff",
      cursor: "pointer",
      fontSize: 16,
      fontWeight: 700,
    },
    hint: { fontSize: 12, color: "#6B7280", lineHeight: "18px" },
    error: { fontSize: 12, color: "#DC2626" },
    canvas: { display: "none" },
    badge: {
      position: "absolute" as const,
      left: 16, top: 16,
      padding: "6px 10px",
      borderRadius: 999,
      background: "rgba(34,126,255,0.9)",
      color: "#fff",
      fontWeight: 700,
      fontSize: 12,
    },
  }), []);

  const handleShotAndSave = async () => {
    setMessage(null);
    const blob = capture();
    if (!blob) {
      setMessage("캡처 실패: 카메라 초기화 상태를 확인해 주세요.");
      return;
    }
    try {
      setSaving(true);
      const { path } = await uploadImage(blob);
      setMessage("저장 완료");
      onConfirm?.(path);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.header}>{title}</div>

      <div style={styles.body}>
        {/* LEFT: Camera */}
        <div style={styles.videoWrap}>
          <video ref={videoRef} style={styles.videoEl} playsInline muted />

          {/* 상태 뱃지 */}
          <div style={styles.badge}>
            {state.isReady ? "카메라 준비됨" : "카메라 준비중…"}
          </div>

          {/* 감지 박스 (얼굴 등) – 실제 감지 결과 넣어주면 표시됨 */}
          {state.detection && (
            <div
              style={styles.overlayBox(
                state.detection.x,
                state.detection.y,
                state.detection.w,
                state.detection.h
              )}
            />
          )}
        </div>

        {/* RIGHT: Controls */}
        <div style={styles.side}>
          <div style={styles.card}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>안내</div>
            <div style={styles.hint}>
              카메라 화면을 확인한 뒤 <b>촬영</b>을 눌러 주세요. 촬영된 이미지는 로컬 서버에 저장됩니다.
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>동작</div>
            <div style={styles.btnRow}>
              <button style={styles.btn} onClick={onCancel}>취소</button>
              <button style={styles.btnPrimary} onClick={handleShotAndSave} disabled={!state.isReady || saving}>
                {saving ? "저장중…" : "촬영 및 저장"}
              </button>
            </div>
            {message && <div style={{ marginTop: 10, ...(message.includes("완료") ? styles.hint : styles.error) }}>{message}</div>}
          </div>
        </div>
      </div>

      {/* 캡처용 캔버스 (숨김) */}
      <canvas ref={canvasRef} style={styles.canvas} />
    </div>
  );
}
