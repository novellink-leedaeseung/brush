import React, {useEffect, useState} from 'react'
import {parseGradeClass} from '@/utils/gradeClass'
import '@/index.css'
import {useNavigate} from "react-router-dom";
import {clearCapturedImage, readCapturedImage, useCapturedImage} from "@/hooks/cameraConfirm/useCapturedImage.ts";
import {saveImageToServer} from "@/service/photoService.ts";
import Header from "@/components/Header.tsx";
import ImageArea from "@/components/cameraConfirm/ImageArea.tsx";
import ButtonRow from "@/components/cameraConfirm/ButtonRow.tsx";
import LunchFalseModal from "@/components/LunchFalseModal.tsx";
import CompleteModal from "@/components/cameraConfirm/CompleteModal.tsx";
import {config} from "@/config.ts";


const isLunchTime = () => {
    const h = new Date().getHours();
    return h >= config.lunchStartTime && h < config.lunchEndTime
}


const CameraConfirmPage: React.FC = () => {
    const navigate = useNavigate()
    const {capturedImage, setCapturedImage} = useCapturedImage()
    const [showLunchModal, setShowLunchModal] = useState(false)
    const [showCompleteModal, setShowCompleteModal] = useState(false)
    const [isUploading, setIsUploading] = useState(false)


    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowLunchModal(false);
                document.body.style.overflow = 'auto'
            }
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [])


    const handleRetake = () => navigate('/kiosk/camera')
    const handleHome = () => window.location.replace('/')


    const handleImageSave = async () => {
        try {
            setIsUploading(true)
            const imageDataUrl = readCapturedImage()
            if (!imageDataUrl) {
                alert('저장할 이미지가 없습니다. 다시 촬영해주세요.');
                return false
            }
            await saveImageToServer(imageDataUrl)
            return true
        } catch (e: any) {
            alert(`이미지 저장 실패: ${e?.message || e}`)
            return false
        } finally {
            setIsUploading(false)
        }
    }


    const sendMember = async (lunch: boolean) => {
        const name = localStorage.getItem('name') || '익명'
        const phone = localStorage.getItem('phone') || ''
        let gradeClass = localStorage.getItem('gradeClass') || ''
        let gender = (localStorage.getItem('gender') || '') === 'M' ? '남자' : '여자'
        const inputNumber = localStorage.getItem('inputNumber') || ''
        const userNo = inputNumber
        if (inputNumber.length === 6 || inputNumber.length === 5) {
            const gc = parseGradeClass(inputNumber);
            gradeClass = `${gc.grade}-${gc.classNo}`
        }


        const res = await fetch('http://localhost:3001/api/members', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, phone, gradeClass, gender, userNo, lunch})
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
    }


    const completeAndGoHome = () => {
        setShowCompleteModal(true);
        setTimeout(() => {
            setShowCompleteModal(false);
            clearCapturedImage();
            window.location.replace('/')
        }, 2000)
    }


    const handleRegister = async () => {
        let lunch = isLunchTime(); // todo 원상복귀 필요
        if (isUploading) return
        if (!lunch) {
            setShowLunchModal(true);
            document.body.style.overflow = 'hidden';
            return
        }
        try {
            setIsUploading(true);
            const ok = await handleImageSave();
            if (!ok) return;
            await sendMember(lunch);
            completeAndGoHome()
        } catch (e: any) {
            alert('등록 실패: ' + (e?.message || e))
        } finally {
            setIsUploading(false)
        }
    }


    const handleLunchModalNo = () => {
        setShowLunchModal(false);
        document.body.style.overflow = 'auto'
    }
    const handleLunchModalRegister = async () => {
        const lunch = isLunchTime();
        setShowLunchModal(false);
        document.body.style.overflow = 'auto'
        try {
            setIsUploading(true);
            const ok = await handleImageSave();
            if (!ok) return;
            await sendMember(lunch);
            completeAndGoHome()
        } catch (e: any) {
            alert('등록 실패: ' + (e?.message || e))
        } finally {
            setIsUploading(false)
        }
    }


    return (
        <div style={{backgroundColor: '#f5f5f5', minHeight: '100vh'}}>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            <div id="app-viewport">
                <Header/>
                <ImageArea capturedImage={capturedImage} onRetake={handleRetake} onError={() => setCapturedImage('')}/>
                <ButtonRow onRetake={handleRetake} onHome={handleHome} onRegister={handleRegister}
                           isUploading={isUploading}/>
            </div>
            <LunchFalseModal isOpen={showLunchModal} onNo={handleLunchModalNo} onRegister={handleLunchModalRegister}
                             onClose={() => setShowLunchModal(false)}/>
            <CompleteModal isVisible={showCompleteModal}/>
        </div>
    )
}


export default CameraConfirmPage
