// LunchFalseModal.tsx
import React from 'react'
import ReactDOM from 'react-dom'

type Props = {
  isOpen: boolean
  onClose: () => void
  onNo: () => void
  onRegister: () => void
  id?: string
}

const LunchFalseModal: React.FC<Props> = ({ isOpen, onClose, onNo, onRegister, id = 'lunchFalseModal' }) => {
  if (!isOpen) return null

  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(49,49,49,0.6)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'lunch-false-fade-in 0.3s ease',
  }

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: 932,
    maxWidth: '90vw',
    height: 675,
    maxHeight: '80vh',
    borderRadius: 41,
    boxShadow: '2px 2px 2px 0 rgba(42,73,148,0.09)',
    animation: 'lunch-false-slide-up 0.3s ease',
  }

  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: '#ffffff',
    borderRadius: 50,
    boxShadow: '2px 2px 2px 0 rgba(0,79,153,0.09)',
  }

  const clockStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: 60,
    width: 130,
    height: 130,
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }

  const mainMsg: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: 200,
    width: '80%',
    height: 130,
    transform: 'translateX(-50%)',
    fontWeight: 700,
    fontSize: 64,
    lineHeight: 1.4,
    letterSpacing: -1.6,
    textAlign: 'center',
    color: '#4b4948',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const subMsg: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: 330,
    width: '80%',
    height: 130,
    transform: 'translateX(-50%)',
    fontWeight: 500,
    fontSize: 64,
    lineHeight: 1.4,
    letterSpacing: -1.6,
    textAlign: 'center',
    color: '#004f99',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const btnRow: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: 505,
    width: 828,
    maxWidth: '90%',
    height: 120,
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 28,
  }

  const btnBase: React.CSSProperties = {
    flex: 1,
    height: 120,
    borderRadius: 8,
    border: 'none',
    fontFamily: 'Pretendard, sans-serif',
    fontWeight: 700,
    fontSize: 40,
    lineHeight: 1.6,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 24px',
    boxSizing: 'border-box',
  }

  const btnSecondary: React.CSSProperties = {
    ...btnBase,
    background: '#e7eaf3',
    color: '#595757',
    border: '1px solid #eaecf0',
  }

  const btnPrimary: React.CSSProperties = {
    ...btnBase,
    background: 'linear-gradient(45deg, #2970ff 0%, #0040c1 100%)',
    color: '#fff',
    border: '1px solid transparent',
  }

  const body = (
    <div style={overlayStyle} id={id} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div style={containerStyle} onClick={(e) => e.stopPropagation()}>
        <div style={backgroundStyle} />
        <div style={clockStyle}>
          <img src="/assets/icon/clock.svg" alt="시간 아이콘" width={130} height={130} />
        </div>
        <div style={mainMsg}>지금은 점심 시간이 아닙니다</div>
        <div style={subMsg}>그래도 등록 할까요?</div>
        <div style={btnRow}>
          <button type="button" style={btnSecondary} onClick={onNo}>
            아니요
          </button>
          <button type="button" style={btnPrimary} onClick={onRegister}>
            등록
          </button>
        </div>
      </div>
    </div>
  )

  return ReactDOM.createPortal(body, document.body)
}

export default LunchFalseModal
