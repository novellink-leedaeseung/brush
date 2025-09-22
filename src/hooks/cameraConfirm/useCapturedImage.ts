import { useEffect, useState } from 'react'


const KEYS = ['capturedImage', 'camara.capturedPhoto', 'captured-photo'] as const
export const useCapturedImage = () => {
const [capturedImage, setCapturedImage] = useState<string>('')
useEffect(() => {
let saved: string | null = null
for (const k of KEYS) { saved = sessionStorage.getItem(k); if (saved) break }
if (saved) setCapturedImage(saved); else console.log('세션 키들:', Object.keys(sessionStorage))
}, [])
return { capturedImage, setCapturedImage }
}


export const readCapturedImage = () => {
for (const k of KEYS) { const v = sessionStorage.getItem(k); if (v) return v }
return null
}


export const clearCapturedImage = () => { KEYS.forEach(k => sessionStorage.removeItem(k)) }