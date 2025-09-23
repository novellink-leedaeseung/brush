import React, { useState, useEffect } from 'react'
import { useRanking } from '@/contexts/RankingContext'

const DebugPanel: React.FC = () => {
  const { rankedUsers, currentUserRank, isLoading, clearAllRecords } = useRanking()
  const [isOpen, setIsOpen] = useState(false)
  const [storageData, setStorageData] = useState<any>(null)

  useEffect(() => {
    const updateStorageData = () => {
      try {
        const records = localStorage.getItem('brushing-ranking-records')
        const userRank = localStorage.getItem('brushing-current-user-rank')
        
        setStorageData({
          records: records ? JSON.parse(records) : null,
          userRank: userRank ? parseInt(userRank) : null,
          localStorage: {
            length: localStorage.length,
            keys: Object.keys(localStorage)
          }
        })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setStorageData({ error: errorMessage })
      }
    }

    updateStorageData()
    const interval = setInterval(updateStorageData, 1000)
    
    return () => clearInterval(interval)
  }, [])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px',
          backgroundColor: '#1F2937',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          zIndex: 9999,
          fontSize: '20px'
        }}
      >
        🐛
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '600px',
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      color: 'white',
      padding: '20px',
      borderRadius: '12px',
      fontSize: '14px',
      overflow: 'auto',
      zIndex: 9999,
      fontFamily: 'Monaco, monospace'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px',
        borderBottom: '1px solid #374151',
        paddingBottom: '10px'
      }}>
        <h3 style={{ margin: 0, color: '#10B981' }}>🐛 Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ❌
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ color: '#F59E0B', marginBottom: '8px' }}>Context State</h4>
        <div>• Loading: {isLoading ? '🔄' : '✅'}</div>
        <div>• Records: {rankedUsers.length}</div>
        <div>• Current User Rank: {currentUserRank || 'None'}</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ color: '#F59E0B', marginBottom: '8px' }}>localStorage</h4>
        <div>• Keys: {storageData?.localStorage?.keys?.length || 0}</div>
        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
          {storageData?.localStorage?.keys?.join(', ') || 'None'}
        </div>
        <div>• Records in Storage: {storageData?.records?.length || 0}</div>
        <div>• User Rank in Storage: {storageData?.userRank || 'None'}</div>
      </div>

      {storageData?.error && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ color: '#EF4444', marginBottom: '8px' }}>Error</h4>
          <div style={{ color: '#FCA5A5', fontSize: '12px' }}>
            {storageData.error}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ color: '#F59E0B', marginBottom: '8px' }}>Actions</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => {
              console.log('🔍 Full Debug Info:')
              console.log('Context:', { rankedUsers, currentUserRank, isLoading })
              console.log('Storage:', storageData)
              console.log('localStorage raw:', {
                records: localStorage.getItem('brushing-ranking-records'),
                userRank: localStorage.getItem('brushing-current-user-rank')
              })
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📋 Log Full State
          </button>
          
          <button
            onClick={() => {
              if (window.confirm('Clear all localStorage data?')) {
                localStorage.clear()
                window.location.reload()
              }
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: '#DC2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🗑️ Clear Storage
          </button>
          
          <button
            onClick={() => {
              clearAllRecords()
              setTimeout(() => window.location.reload(), 100)
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: '#7C3AED',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔄 Reset & Reload
          </button>
        </div>
      </div>

      {rankedUsers.length > 0 && (
        <div>
          <h4 style={{ color: '#F59E0B', marginBottom: '8px' }}>Top 3 Records</h4>
          {rankedUsers.slice(0, 3).map((user) => (
            <div key={user.id} style={{ 
              fontSize: '12px', 
              marginBottom: '4px',
              color: currentUserRank === user.rank ? '#10B981' : '#E5E7EB'
            }}>
              {user.rank}. {user.name} ({user.className}) - {user.brushingTime.toLocaleTimeString()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DebugPanel
