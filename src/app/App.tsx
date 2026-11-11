import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { DemoBadge } from '../components/ui/DemoBadge';
import { Toast } from '../components/ui/Toast';
import { EnginePanel } from '../features/engine-panel/EnginePanel';
import { AccountPage, AssetsPage, SavingsPage } from '../features/banking/AssetsPages';
import { BankingShell } from '../features/banking/BankingShell';
import { BenefitsPage, BenefitDetailsPage, MenuPage, NotificationsPage } from '../features/banking/ServicesPages';
import { SpendingPage } from '../features/banking/SpendingPage';
import { CardDetailsPage, UniversalBankingPage } from '../features/banking/UniversalBanking';
import { HandoffPage } from '../features/handoff/HandoffPage';
import { HomePage } from '../features/home/HomePage';
import { CoolingPage } from '../features/invest/CoolingPage';
import { ExplainPage } from '../features/invest/ExplainPage';
import { FinalPage } from '../features/invest/FinalPage';
import { ProfilePage } from '../features/invest/ProfilePage';
import { QuizPage } from '../features/invest/QuizPage';
import { LauncherPage } from '../features/launcher/LauncherPage';
import { PhoneHomeDemoPage } from '../features/launcher/PhoneHomeDemoPage';
import { ChatPage } from '../features/navi/ChatPage';
import { ConfirmDepositPage } from '../features/navi/ConfirmDepositPage';
import { DonePage } from '../features/navi/DonePage';
import { NoResponsePage } from '../features/navi/NoResponsePage';
import { OptionsPage } from '../features/navi/OptionsPage';
import { SummaryPage } from '../features/navi/SummaryPage';
import { SimulatorPage } from '../features/simulator/SimulatorPage';
import { DEFAULT_PERSONA_ID } from '../mock/personas';
import { useDemoStore } from '../store/useDemoStore';
import { PhoneFrame } from './PhoneFrame';
import { RequireCompletion, RequireInvest, RequirePersona } from './guards';

function AnimatedOutlet() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      key={location.pathname}
      className="h-full"
      initial={reduceMotion ? false : { opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.16 }}
    >
      <Outlet />
    </motion.div>
  );
}

function MaturityEntry() {
  const personaId = useDemoStore((state) => state.personaId);
  const selectPersona = useDemoStore((state) => state.selectPersona);
  useEffect(() => {
    if (!useDemoStore.getState().personaId) selectPersona(DEFAULT_PERSONA_ID);
  }, [selectPersona]);
  return personaId ? <Navigate to="/navi/summary" replace /> : null;
}

function Shell() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const openMaturity = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data?.type === 'won:open-maturity') {
        navigate('/maturity');
      }
    };
    navigator.serviceWorker.addEventListener('message', openMaturity);
    return () => navigator.serviceWorker.removeEventListener('message', openMaturity);
  }, [navigate]);
  const toast = useDemoStore((state) => state.toast);
  return (
    <>
      <div className="relative min-h-0 flex-1">
        <AnimatedOutlet />
      </div>
      <EnginePanel />
      <DemoBadge />
      <Toast message={toast} />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <PhoneFrame>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route element={<BankingShell />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/assets" element={<AssetsPage />} />
              <Route path="/assets/accounts/:accountId" element={<AccountPage />} />
              <Route path="/savings" element={<SavingsPage />} />
              <Route path="/spending" element={<SpendingPage />} />
              <Route path="/banking" element={<UniversalBankingPage />} />
              <Route path="/banking/card/:view" element={<CardDetailsPage />} />
              <Route path="/benefits" element={<BenefitsPage />} />
              <Route path="/benefits/services/:serviceId" element={<BenefitDetailsPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>
            <Route path="/maturity" element={<MaturityEntry />} />
            <Route path="/demo" element={<LauncherPage />} />
            <Route path="/demo/phone" element={<PhoneHomeDemoPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/navi/no-response" element={<NoResponsePage />} />
            <Route element={<RequirePersona />}>
              <Route path="/navi/summary" element={<SummaryPage />} />
              <Route path="/navi/chat" element={<ChatPage />} />
              <Route path="/navi/options" element={<OptionsPage />} />
              <Route path="/navi/confirm-deposit" element={<ConfirmDepositPage />} />
              <Route path="/navi/handoff" element={<HandoffPage />} />
              <Route element={<RequireCompletion />}>
                <Route path="/navi/done" element={<DonePage />} />
              </Route>
              <Route element={<RequireInvest step="profile" />}>
                <Route path="/navi/invest/profile" element={<ProfilePage />} />
              </Route>
              <Route element={<RequireInvest step="explain" />}>
                <Route path="/navi/invest/explain" element={<ExplainPage />} />
              </Route>
              <Route element={<RequireInvest step="quiz" />}>
                <Route path="/navi/invest/quiz" element={<QuizPage />} />
              </Route>
              <Route element={<RequireInvest step="cooling" />}>
                <Route path="/navi/invest/cooling" element={<CoolingPage />} />
              </Route>
              <Route element={<RequireInvest step="final" />}>
                <Route path="/navi/invest/final" element={<FinalPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </PhoneFrame>
    </BrowserRouter>
  );
}
