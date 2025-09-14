import React from 'react'
import { useNavigate } from 'react-router-dom'

interface TouchButtonProps {
  to: string
  text?: string
}

const TouchButton: React.FC<TouchButtonProps> = ({ to, text = "화면을 터치해주세요!" }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(to)
  }

  return (
    <button onClick={handleClick} style={{
      width: '1080px',
      height: '354px',
      padding: 0,
      border: 'none',
      cursor: 'pointer',
      background: '#333331',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ marginTop: '40px' }}>
        <img src="/public/assets/icon/pinger.gif" style={{
          width: 'auto',
          height: 'auto',
          marginBottom: '10px'
        }} alt="터치 애니메이션" />
      </div>
      <div style={{
        width: '100%',
        height: '100%',
        textAlign: 'center',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'column',
        color: 'white',
        fontSize: '52px',
        fontFamily: 'Jalnan2',
        fontWeight: 400,
        wordWrap: 'break-word'
      }}>
        {text}
      </div>
    </button>
  )
}

export default TouchButton
