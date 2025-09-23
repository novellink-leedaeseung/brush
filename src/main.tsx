import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'

// 로컬 스토리지 초기화
localStorage.clear();
sessionStorage.clear();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
