import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import UserFindPage from './pages/UserFindPage'
import CameraPage from './pages/CameraPage'
import CameraConfirmPage from './pages/CameraConfirmPage'
import UserConfirmPage from './pages/UserConfirmPage'

function App() {
  return (
    <Router>
      <div style={{ width: '1080px', height: '1920px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/kiosk/user-find" element={<UserFindPage />} />
          <Route path="/kiosk/camera" element={<CameraPage />} />
          <Route path="/kiosk/camera-confirm" element={<CameraConfirmPage />} />
          <Route path="/kiosk/user-confirm" element={<UserConfirmPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
