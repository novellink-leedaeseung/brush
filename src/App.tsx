import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { RankingProvider } from './contexts/RankingContext'
import HomePage from './pages/HomePage.tsx'
import UserFindPage from './pages/UserFindPage'
import CameraPage from './pages/CameraPage'
import CameraConfirmPage from './pages/CameraConfirmPage'
import UserConfirmPage from './pages/UserConfirmPage'
import RegistrationCompletePage from './pages/RegistrationCompletePage'
import TestRegistrationPage from './pages/TestRegistrationPage'

function App() {
  return (
    <RankingProvider>
      <Router>
        <div style={{ width: '1080px', height: '1920px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/kiosk/user-find" element={<UserFindPage />} />
            <Route path="/kiosk/camera" element={<CameraPage />} />
            <Route path="/kiosk/camera-confirm" element={<CameraConfirmPage />} />
            <Route path="/kiosk/user-confirm" element={<UserConfirmPage />} />
            <Route path="/registration-complete" element={<RegistrationCompletePage />} />
            <Route path="/test-registration" element={<TestRegistrationPage />} />
          </Routes>
        </div>
      </Router>
    </RankingProvider>
  )
}

export default App
