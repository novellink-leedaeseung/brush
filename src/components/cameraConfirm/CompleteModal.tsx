import React from 'react'


const CompleteModal = ({isVisible}: { isVisible: boolean }) => {
    if (!isVisible) return null
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(49,49,49,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: 20
        }}>
            <div style={{
                width: 740,
                height: 475,
                maxWidth: '90vw',
                maxHeight: '80vh',
                background: '#FFFFFF',
                borderRadius: 50,
                boxShadow: '2px 2px 2px rgba(42,73,148,0.09), 2px 2px 2px rgba(0,79,153,0.09)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{marginTop: 60, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <img src="/assets/icon/ticktick.svg" alt="완료"
                         style={{width: 130, height: 130, objectFit: 'contain'}}/>
                </div>
                <div style={{width: 570, height: 90, marginTop: 75}}>
                    <h1 style={{
                        marginTop: 75,
                        fontFamily: 'Pretendard, Arial, sans-serif',
                        fontWeight: 700,
                        fontSize: 64,
                        lineHeight: 1.4,
                        letterSpacing: '-2.5%',
                        textAlign: 'center',
                        color: '#004F99',
                        margin: 0,
                        padding: 0
                    }}>양치 인증 완료!</h1>
                </div>
            </div>
        </div>
    )
}


export default CompleteModal