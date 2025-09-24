// CameraConfirmPage.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { parseGradeClass } from '@/utils/gradeClass'
import '@/index.css'
import { useNavigate } from "react-router-dom";
import { clearCapturedImage, readCapturedImage, useCapturedImage } from "@/hooks/cameraConfirm/useCapturedImage.ts";
import { saveImageToServer } from "@/service/photoService.ts";
import Header from "@/components/Header.tsx";
import ImageArea from "@/components/cameraConfirm/ImageArea.tsx";
import ButtonRow from "@/components/cameraConfirm/ButtonRow.tsx";
import LunchFalseModal from "@/components/LunchFalseModal.tsx";
import CompleteModal from "@/components/cameraConfirm/CompleteModal.tsx";
import { useConfig, getApiBase } from "@/hooks/useConfig"; // ✅ 런타임 config

const CameraConfirmPage: React.FC = () => {
  const navigate = useNavigate()
  const { capturedImage, setCapturedImage } = useCapturedImage()
  const [showLunchModal, setShowLunchModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { config } = useConfig(); // { config, reload }

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
  const handleHome = () => window.location.href = window.location.origin + window.location.pathname + "#/"

  // ✅ config 로딩 전에도 안전하게 동작하는 점심시간 체크 (기본값 12~13시)
  const isLunchTime = useCallback(() => {
    const h = new Date().getHours();
    const start = config?.lunchStartTime ?? 12;
    const end = config?.lunchEndTime ?? 13;
    return h >= start && h < end;
  }, [config?.lunchStartTime, config?.lunchEndTime]);

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

  // ✅ API 베이스를 런타임에서 읽어 사용
  const sendMember = async (lunch: boolean) => {
    const base = await getApiBase();
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

    const res = await fetch(`${base}/api/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, gradeClass, gender, userNo, lunch })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }

  const completeAndGoHome = () => {
    setShowCompleteModal(true);
    setTimeout(() => {
      setShowCompleteModal(false);
      clearCapturedImage();
      window.location.href = window.location.origin + window.location.pathname + "#/"
    }, 2000)
  }

  const handleRegister = async () => {
    const lunch = isLunchTime(); // todo 원상복귀 필요
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
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
      <div id="app-viewport">
        <Header />
        <ImageArea capturedImage={capturedImage} onRetake={handleRetake} onError={() => setCapturedImage('')} />
        <ButtonRow onRetake={handleRetake} onHome={handleHome} onRegister={handleRegister} isUploading={isUploading} />
      </div>
      <LunchFalseModal
        isOpen={showLunchModal}
        onNo={handleLunchModalNo}
        onRegister={handleLunchModalRegister}
        onClose={() => setShowLunchModal(false)}
      />
      <CompleteModal isVisible={showCompleteModal} />
    </div>
  )
}

export default CameraConfirmPage
