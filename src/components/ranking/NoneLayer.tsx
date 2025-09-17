import React from 'react';

export const NoneLayer : React.FC = () => {
  const containerStyle : React.CSSProperties = {
    width: '1080px',
    backgroundColor: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    margin: '0 auto'
  };

  const happyIconContainerStyle : React.CSSProperties = {
    width: '150px',
    margin: '125px auto 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const happyFaceStyle : React.CSSProperties = {
    width: '125px',
    height: '125px',
    border: '12px solid #B5B5B6',
    borderRadius: '50%',
    position: 'relative',
    backgroundColor: 'transparent'
  };

  const eyeStyle : React.CSSProperties = {
    width: '14px',
    height: '14px',
    backgroundColor: '#B5B5B6',
    borderRadius: '50%',
    position: 'absolute',
    top: '36.5px'
  };

  const leftEyeStyle : React.CSSProperties = {
    ...eyeStyle,
    left: '33.5px'
  };

  const rightEyeStyle : React.CSSProperties = {
    ...eyeStyle,
    right: '33.5px'
  };

  const smileStyle : React.CSSProperties = {
    position: 'absolute',
    bottom: '28px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '32px',
    height: '16px',
    border: '10px solid #B5B5B6',
    borderTop: 'none',
    borderRadius: '0 0 32px 32px',
    backgroundColor: 'transparent'
  };

  const noRankingTextStyle : React.CSSProperties = {
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    fontWeight: '700',
    fontSize: '72px',
    lineHeight: '1.4',
    letterSpacing: '-1.8px',
    color: '#B5B5B6',
    textAlign: 'center',
    margin: '50px 0 0 0',
    width: '100%'
  };

  const messageTextStyle : React.CSSProperties = {
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    fontWeight: '700',
    fontSize: '52px',
    lineHeight: '1.4',
    letterSpacing: '-1.3px',
    color: '#4B4948',
    textAlign: 'center',
    margin: '24px 0 0 0',
    width: '100%'
  };

  return (
    <div style={containerStyle}>
      {/* Happy 아이콘 */}
      <div style={happyIconContainerStyle}>
        <div style={happyFaceStyle}>
          <div style={leftEyeStyle}></div>
          <div style={rightEyeStyle}></div>
          <div style={smileStyle}></div>
        </div>
      </div>

      {/* "아직 순위가 없어요" 텍스트 */}
      <div style={noRankingTextStyle}>아직 순위가 없어요.</div>

      {/* "양치 인증하여 순위등록 해보세요!" 텍스트 */}
      <div style={messageTextStyle}>양치 인증하여 순위등록 해보세요!</div>
    </div>
  );
};

export default NoneLayer;