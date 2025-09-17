// LunchFalseModal.tsx
import React from 'react';

type LunchFalseModalProps = {
  isOpen: boolean;
  onClose: () => void;      // 바깥(오버레이) 클릭 시 닫기
  onNo: () => void;         // "아니요" 버튼
  onRegister: () => void;   // "등록" 버튼
  id?: string;
};

const LunchFalseModal: React.FC<LunchFalseModalProps> = ({
  isOpen,
  onClose,
  onNo,
  onRegister,
  id = 'lunchFalseModal',
}) => {
  if (!isOpen) return null;

  // 오버레이 클릭했을 때만 닫히게 (컨테이너 클릭은 무시)
  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="lunch-false-modal-overlay"
      id={id}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="lunch-false-container" onClick={(e) => e.stopPropagation()}>
        {/* 배경 */}
        <div className="lunch-false-background" />

        {/* 시계 아이콘 */}
        <div className="lunch-false-clock-container">
          <img src="/public/assets/icon/clock.svg" alt="시간 아이콘" />
        </div>

        {/* 메인 메시지 */}
        <div className="lunch-false-main-message">
          지금은 점심 시간이 아닙니다
        </div>

        {/* 보조 메시지 */}
        <div className="lunch-false-secondary-message">
          그래도 등록 할까요?
        </div>

        {/* 버튼들 */}
        <div className="lunch-false-buttons-container">
          <button
            type="button"
            className="lunch-false-button lunch-false-button-secondary"
            onClick={onNo}
          >
            아니요
          </button>
          <button
            type="button"
            className="lunch-false-button lunch-false-button-primary"
            onClick={onRegister}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default LunchFalseModal;
