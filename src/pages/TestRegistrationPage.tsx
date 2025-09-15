import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRanking } from '../contexts/RankingContext'
import Header from '../components/Header'

const TestRegistrationPage: React.FC = () => {
  const navigate = useNavigate()
  const { clearAllRecords } = useRanking()
  const [formData, setFormData] = useState({
    name: '김테스트',
    className: '2-3반',
    mealType: 'lunch' as 'lunch' | 'outside',
    profileImage: '/assets/images/man.png'
  })

  const handleSubmit = () => {
    // 현재 시간에 랜덤하게 몇 초를 더해서 다양한 순위 테스트
    const randomSeconds = Math.floor(Math.random() * 300) // 0-5분 랜덤
    const brushingDuration = 90 + Math.floor(Math.random() * 60) // 90-150초 랜덤

    navigate('/registration-complete', {
      state: {
        name: formData.name,
        className: formData.className,
        profileImage: formData.profileImage,
        mealType: formData.mealType,
        brushingDuration
      }
    })
  }

  const presetStudents = [
    { name: '김민수', className: '1-1반', profileImage: '/assets/images/man.png' },
    { name: '이서영', className: '1-2반', profileImage: '/assets/images/woman.png' },
    { name: '박준호', className: '2-1반', profileImage: '/assets/images/man.png' },
    { name: '최유진', className: '2-2반', profileImage: '/assets/images/woman.png' },
    { name: '정태현', className: '3-1반', profileImage: '/assets/images/man.png' },
    { name: '강지민', className: '3-2반', profileImage: '/assets/images/woman.png' }
  ]

  const handleQuickRegister = (student: typeof presetStudents[0]) => {
    const brushingDuration = 90 + Math.floor(Math.random() * 60)
    
    navigate('/registration-complete', {
      state: {
        name: student.name,
        className: student.className,
        profileImage: student.profileImage,
        mealType: formData.mealType,
        brushingDuration
      }
    })
  }

  return (
    <div style={{ width: '1080px', height: '1920px', backgroundColor: 'white' }}>
      <Header title="테스트 등록" />
      
      <div style={{
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        <div style={{
          fontSize: '48px',
          fontFamily: 'Pretendard',
          fontWeight: 700,
          color: '#111111',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          랭킹 시스템 테스트
        </div>

        {/* 수동 등록 폼 */}
        <div style={{
          background: '#F8F9FA',
          padding: '40px',
          borderRadius: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            fontSize: '36px',
            fontFamily: 'Pretendard',
            fontWeight: 600,
            marginBottom: '30px',
            color: '#111111'
          }}>
            수동 등록
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '28px', fontWeight: 500, display: 'block', marginBottom: '10px' }}>
                이름:
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{
                  width: '300px',
                  height: '60px',
                  fontSize: '24px',
                  padding: '0 20px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '10px'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '28px', fontWeight: 500, display: 'block', marginBottom: '10px' }}>
                반:
              </label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({...formData, className: e.target.value})}
                style={{
                  width: '200px',
                  height: '60px',
                  fontSize: '24px',
                  padding: '0 20px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '10px'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '28px', fontWeight: 500, display: 'block', marginBottom: '10px' }}>
                식사 유형:
              </label>
              <select
                value={formData.mealType}
                onChange={(e) => setFormData({...formData, mealType: e.target.value as 'lunch' | 'outside'})}
                style={{
                  width: '200px',
                  height: '60px',
                  fontSize: '24px',
                  padding: '0 20px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '10px'
                }}
              >
                <option value="lunch">점심</option>
                <option value="outside">외</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              style={{
                width: '200px',
                height: '80px',
                backgroundColor: '#22C55E',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                fontSize: '28px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              등록하기
            </button>
          </div>
        </div>

        {/* 빠른 등록 버튼들 */}
        <div style={{
          background: '#F0FDF4',
          padding: '40px',
          borderRadius: '20px'
        }}>
          <div style={{
            fontSize: '36px',
            fontFamily: 'Pretendard',
            fontWeight: 600,
            marginBottom: '30px',
            color: '#111111'
          }}>
            빠른 등록 (프리셋 학생들)
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            {presetStudents.map((student, index) => (
              <button
                key={index}
                onClick={() => handleQuickRegister(student)}
                style={{
                  height: '120px',
                  backgroundColor: 'white',
                  border: '2px solid #22C55E',
                  borderRadius: '15px',
                  fontSize: '32px',
                  fontWeight: 600,
                  color: '#16A34A',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#22C55E'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                  e.currentTarget.style.color = '#16A34A'
                }}
              >
                {student.className} {student.name}
              </button>
            ))}
          </div>
        </div>

        {/* 데이터 관리 */}
        <div style={{
          background: '#FEF2F2',
          padding: '40px',
          borderRadius: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            fontSize: '36px',
            fontFamily: 'Pretendard',
            fontWeight: 600,
            marginBottom: '30px',
            color: '#DC2626'
          }}>
            데이터 관리
          </div>

          <button
            onClick={() => {
              if (window.confirm('모든 랭킹 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                clearAllRecords()
                alert('랭킹 데이터가 초기화되었습니다.')
              }
            }}
            style={{
              width: '300px',
              height: '80px',
              backgroundColor: '#DC2626',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              fontSize: '28px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            전체 데이터 초기화
          </button>
        </div>

        {/* 홈으로 돌아가기 */}
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            height: '100px',
            backgroundColor: '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            fontSize: '36px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  )
}

export default TestRegistrationPage
