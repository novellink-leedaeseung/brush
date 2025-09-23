import React from 'react'
import ActionCard from './ActionCard'


export type ButtonRowProps = { onRetake: () => void; onHome: () => void; onRegister: () => void; isUploading: boolean }


const ButtonRow: React.FC<ButtonRowProps> = ({onRetake, onHome, onRegister, isUploading}) => (
    <div style={{
        width: 1080,
        height: 350,
        backgroundColor: 'white',
        display: 'flex',
        position: "relative",
        zIndex: 1,
        borderTop: '0.5px solid rgb(76, 73, 72)',
    }}>
        <div className="btn-container" onClick={onRetake} style={{

            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignContent: 'center',
            marginTop: 26,
            marginLeft: 36,
            marginRight: 24,
            width: 320,
            height: 300,
            backgroundColor: '#FFFFFF',
            boxShadow: '2px 2px 2px rgba(0,0,0,0.16), 1px 1px 7px rgba(0,0,0,0.09)',
            borderRadius: 32,
        }}>
            <div style={{
                width: 250,
                height: 190,
                display: 'inline-flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 36
            }}>
                <div style={{width: 110, height: 110.84}}><img src="/public/assets/icon/retake.svg" alt="재촬영"/></div>
                <div style={{
                    alignSelf: 'stretch',
                    height: 43,
                    textAlign: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    color: '#004F99',
                    fontSize: 36,
                    fontFamily: 'Pretendard',
                    fontWeight: 600,
                    lineHeight: '56px'
                }}>재촬영
                </div>
            </div>
        </div>


        <ActionCard icon={<img src="/public/assets/icon/home.svg" alt="홈"/>} label="처음화면" onClick={onHome}/>


        <ActionCard
            icon={isUploading ? <div style={{
                width: 110,
                height: 110,
                border: '8px solid #f3f3f3',
                borderTop: '8px solid #004F99',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}/> : <img src="/public/assets/icon/toothbrush.svg" alt="양치"/>}
            label={isUploading ? '저장 중...' : '등록'} onClick={onRegister} disabled={isUploading} dimLabel={isUploading}
        />
    </div>
)


export default ButtonRow