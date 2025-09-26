import React from 'react'
import { useNavigate } from 'react-router-dom'

interface TouchButtonProps {
  to: string
  text?: string
  logId?: string
}

const TouchButton: React.FC<TouchButtonProps> = ({ to, text = "화면을 터치해주세요!", logId = "touch-button" }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(to)
  }

  return (
    <button type="button" onClick={handleClick} data-log-id={logId} style={{
      width: '1080px',
      height: '354px',
      padding: 0,
      border: 'none',
      cursor: 'pointer',
      background: '#333331',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
        margin: 0,
    }}>
      <div style={{ }}>
        <img src="/assets/icon/pinger.gif" style={{
          width: 'auto',
          height: 'auto',
          marginBottom: '10px'
        }} alt="터치 애니메이션" />
      </div>
      <div style={{
        width: '600px',
        height: '100px',
        textAlign: 'center',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'column',
        color: 'white',
        fontSize: '52px',
        fontFamily: 'Jalnan2',
        fontWeight: 400,
        wordWrap: 'break-word',
          marginBottom: '30px',
      }}>
        {text}
      </div>
    </button>
  )
}

export default TouchButton
