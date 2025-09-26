import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import './index.css'
import { setupApiLogging } from '@/utils/setupApiLogging'

// 로컬 스토리지 초기화
localStorage.clear();
sessionStorage.clear();

setupApiLogging()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
