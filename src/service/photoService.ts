export const saveImageToServer = async (imageDataUrl: string) => {
    const today = new Date()
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0')
    const hh = String(today.getHours()).padStart(2, '0');
    const mm = String(today.getMinutes()).padStart(2, '0');
    const ss = String(today.getSeconds()).padStart(2, '0')
    const phoneNumber = localStorage.getItem('phone') || 'unknown'
    const userNo = localStorage.getItem('inputNumber') || 'unknown'
    const userName = localStorage.getItem('name') || 'user'
    let fileName = `${y}${m}${d}-${hh}-${mm}-${ss}-${phoneNumber}-${userName}`
    if (userNo.length === 6 || userNo.length === 5) fileName = `${y}${m}${d}-${hh}-${mm}-${ss}-${userNo}-${userName}`


    const response = await fetch('http://localhost:3001/api/save-photo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({imageData: imageDataUrl, fileName})
    })
    const result = await response.json()
    if (response.ok && result.success) return {
        success: true,
        message: result.message,
        fileName: result.fileName,
        filePath: result.filePath,
        timestamp: result.timestamp
    }
    throw new Error(result?.error || '이미지 저장에 실패했습니다.')
}