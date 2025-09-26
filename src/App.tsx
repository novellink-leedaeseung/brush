import { useEffect } from 'react';
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
import { logButtonClick } from '@/utils/ipcLogger';

function App() {
  useNoZoomNoContext();
  const { config } = useConfig();

  // 안전 계산: config 없으면 기본 60초
  const timeoutMs = ((config?.timeout ?? 60) * 1000);

  useEffect(() => {
    const handleButtonClick = (event: MouseEvent) => {
      if (!event.isTrusted) return;
      const target = event.target as HTMLElement | null;
      const found = target?.closest?.('button');
      if (!(found instanceof HTMLButtonElement)) return;
      if (found.disabled) return;

      const button = found;
      if (button.dataset?.logManualReported === 'true') {
        return;
      }
      const datasetEntries = Object.entries(button.dataset ?? {});
      const dataAttributes = datasetEntries.length ? Object.fromEntries(datasetEntries) : null;

      const meta: Record<string, string | null> = {
        type: button.getAttribute('type'),
        name: button.getAttribute('name'),
        className: button.className || null,
      };
      const hasMeta = Object.values(meta).some((value) => Boolean(value));

      logButtonClick({
        buttonId: button.dataset?.logId ?? button.id ?? null,
        text: (button.innerText ?? '').trim() || null,
        path: window.location?.hash || window.location?.pathname || null,
        dataAttributes,
        extra: hasMeta ? meta : null,
      });
    };

    document.addEventListener('click', handleButtonClick);
    return () => {
      document.removeEventListener('click', handleButtonClick);
    };
  }, []);

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
