import React from 'react'


type Props = { capturedImage: string; onRetake: () => void; onError: () => void }
const ImageArea: React.FC<Props> = ({capturedImage, onRetake, onError}) => {
    if (capturedImage) {
        return (
            <img id="capturedImg" alt="촬영 이미지" width={798} height={1418} style={{marginLeft: 141}} src={capturedImage}
                 onError={onError}/>
        )
    }
    return (
        <div className="image-placeholder" style={{
            width: 798,
            height: 1418,
            marginLeft: 141,
            background: 'linear-gradient(45deg, #f0f0f0 25%, #e0e0e0 25%, #e0e0e0 50%, #f0f0f0 50%, #f0f0f0 75%, #e0e0e0 75%)',
            backgroundSize: '20px 20px',
            border: '2px dashed #ccc',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#666',
            fontSize: 24,
            fontWeight: 600,
            textAlign: 'center'
        }}>
            <div>📷</div>
            <div style={{marginTop: 20}}>촬영된 이미지가 없습니다</div>
            <div style={{fontSize: 18, marginTop: 10, color: '#999'}}>카메라에서 사진을 촬영해주세요</div>
            <button onClick={onRetake} style={{
                marginTop: 30,
                padding: '15px 30px',
                backgroundColor: '#004f99',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 18,
                cursor: 'pointer'
            }}>카메라로 이동
            </button>
        </div>
    )
}


export default React.memo(ImageArea)