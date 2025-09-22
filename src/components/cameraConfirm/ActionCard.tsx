import React from 'react'


const cardStyle: React.CSSProperties = {
display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', marginTop: 26, marginLeft: 31, marginRight: 24,
width: 320, height: 300, backgroundColor: '#FFFFFF', boxShadow: '2px 2px 2px rgba(0,0,0,0.16), 1px 1px 7px rgba(0,0,0,0.09)', borderRadius: 32, cursor: 'pointer', transition: 'transform .2s ease'
}


const innerStyle: React.CSSProperties = { width: 250, height: 190, display: 'inline-flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 36 }
const labelStyle: React.CSSProperties = { alignSelf: 'stretch', height: 43, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#004F99', fontSize: 36, fontFamily: 'Pretendard', fontWeight: 600, lineHeight: '56px', wordWrap: 'break-word' as const }


export type ActionCardProps = { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; dimLabel?: boolean; extraMarginLeft?: number }
const ActionCard: React.FC<ActionCardProps> = ({ icon, label, onClick, disabled, dimLabel, extraMarginLeft }) => (
<div className="btn-container" onClick={() => !disabled && onClick()} style={{ ...cardStyle, marginLeft: extraMarginLeft ?? 31, opacity: disabled ? 0.7 : 1 }}>
<div style={innerStyle}>
<div style={{ width: 110, height: 110.84, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
<div style={{ ...labelStyle, color: dimLabel ? '#999999' : '#004F99' }}>{label}</div>
</div>
</div>
)


export default ActionCard