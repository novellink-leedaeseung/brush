// components/userFind/NotificationModal.tsx
import React from "react";

interface NotificationModalProps {
  isVisible: boolean;
  message: string;
  maskedPhoneText?: string; // 가운데 크게 보이는 텍스트
  onConfirm?: () => void;   // 확인 버튼 클릭 시
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isVisible,
  message,
  maskedPhoneText = "",
  onConfirm,
}) => {
  if (!isVisible) return null;

  const handleClick = () => {
    if (onConfirm) onConfirm();
    else window.location.href = "/";
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(49, 49, 49, 0.6)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        width: '932px', height: '675px', background: '#FFFFFF',
        borderRadius: '50px', boxShadow: '2px 2px 2px 0px rgba(0, 79, 153, 0.09)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box'
      }}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center'}}>
          <div style={{
            width: '130px', height: '130px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
          }}>
            <img src="/public/assets/icon/warning.svg" alt=""/>
          </div>

          <div style={{
            width: '714px', height: '70px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '18px'
          }}>
            <span style={{
              fontFamily: 'Pretendard, Arial, sans-serif', fontWeight: 700,
              fontSize: '38px', lineHeight: '1.4em', letterSpacing: '-2.5%', textAlign: 'center', color: '#4B4948'
            }}>
              {message}
            </span>
          </div>

          <div style={{
            width: '560px', height: '80px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '18px'
          }}>
            <span style={{
              color: "#004F99", textAlign: "center", fontFeatureSettings: "'liga' off, 'clig' off",
              fontFamily: "Jalnan2", fontSize: "74px", fontStyle: "normal", fontWeight: 400,
              lineHeight: "56px", letterSpacing: "-1.85px",
            }}>
              {maskedPhoneText}
            </span>
          </div>

          <div style={{
            width: '800px', height: '70px', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{color: '#111111', fontSize: 44, fontFamily: 'Pretendard', fontWeight: 500, lineHeight: 61.60}}>보건실에서</span>
            <span style={{color: '#111111', fontSize: 44, fontFamily: 'Pretendard', fontWeight: 700, lineHeight: 61.60}}> </span>
            <span style={{color: '#004F99', fontSize: 44, fontFamily: 'Pretendard', fontWeight: 700, lineHeight: 61.60}}>&nbsp; 보건선생님의 도움</span>
            <span style={{color: '#111111', fontSize: 44, fontFamily: 'Pretendard', fontWeight: 500, lineHeight: 61.60}}>을 받아 주세요.</span>
          </div>
        </div>

        <div
          onClick={handleClick}
          style={{
            width: '630px', height: '120px', background: '#004F99', borderRadius: '16px',
            boxShadow: '0px 4px 2px rgba(0, 0, 0, 0.09)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            flexShrink: 0, marginBottom: '50px', marginLeft: '151px',
          }}
        >
          <span style={{
            fontFamily: 'Pretendard, Arial, sans-serif', fontWeight: 600,
            fontSize: '44px', lineHeight: '1.27em', textAlign: 'center', color: '#FFFFFF'
          }}>
            확인
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
