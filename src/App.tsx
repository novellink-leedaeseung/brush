import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import {RankingProvider} from './contexts/RankingContext'
import HomePage from './pages/HomePage.tsx'
import UserFindPage from './pages/UserFindPage'
import CameraPage from './pages/CameraPage'
import CameraConfirmPage from './pages/CameraConfirmPage'
import UserConfirmPage from './pages/UserConfirmPage'
import RegistrationCompletePage from './pages/RegistrationCompletePage'
import IdleRedirect from "./utils/IdleRedirect.tsx";
import './index.css'
import {useNoZoomNoContext} from "./utils/useNoZoomNoContext.tsx";

function App() {
    useNoZoomNoContext();
    return (
        <RankingProvider>
            <Router>
                {/*todo 나중에 보여줄 때는 타이머 조정할것!*/}
                <IdleRedirect timeout={import.meta.env.VITE_TIMEOUT*1000} to="/">
                    <div style={{width: '1080px', height: '1920px', margin: '0 auto'}}>
                        <Routes>
                            <Route path="/" element={<HomePage/>}/>
                            <Route path="/kiosk/user-find" element={<UserFindPage/>}/>
                            <Route path="/kiosk/camera" element={<CameraPage/>}/>
                            <Route path="/kiosk/camera-confirm" element={<CameraConfirmPage/>}/>
                            <Route path="/kiosk/user-confirm" element={<UserConfirmPage/>}/>
                            <Route path="/registration-complete" element={<RegistrationCompletePage/>}/>
                        </Routes>
                    </div>
                </IdleRedirect>
            </Router>
        </RankingProvider>
    )
}

export default App
