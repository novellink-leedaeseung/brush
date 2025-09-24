import { HashRouter, Routes, Route } from 'react-router-dom';
import { RankingProvider } from '@/contexts/RankingContext';
import HomePage from '@/pages/HomePage';
import UserFindPage from '@/pages/UserFindPage';
import CameraPage from '@/pages/CameraPage';
import CameraConfirmPage from '@/pages/CameraConfirmPage';
import UserConfirmPage from '@/pages/UserConfirmPage';
import RegistrationCompletePage from '@/pages/RegistrationCompletePage';
import IdleRedirect from '@/utils/IdleRedirect';
import { useNoZoomNoContext } from '@/utils/useNoZoomNoContext';
import { useConfig } from '@/hooks/useConfig';

function App() {
  useNoZoomNoContext();
  const { config } = useConfig();

  // 안전 계산: config 없으면 기본 60초
  const timeoutMs = ((config?.timeout ?? 60) * 1000);

  return (
    <RankingProvider>
      <HashRouter>
        <IdleRedirect timeout={timeoutMs} to="/">
          <div style={{ width: '1080px', height: '1920px', margin: '0 auto' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/kiosk/user-find" element={<UserFindPage />} />
              <Route path="/kiosk/camera" element={<CameraPage />} />
              <Route path="/kiosk/camera-confirm" element={<CameraConfirmPage />} />
              <Route path="/kiosk/user-confirm" element={<UserConfirmPage />} />
              <Route path="/registration-complete" element={<RegistrationCompletePage />} />
            </Routes>
          </div>
        </IdleRedirect>
      </HashRouter>
    </RankingProvider>
  );
}

export default App;
