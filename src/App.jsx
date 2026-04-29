import { useState, useEffect, useRef, lazy, Suspense, Component } from "react";
import { supabase } from "./supabase";
import LoadingScreen from "./components/LoadingScreen";
import { ToastProvider } from "./components/Toast";
import "./styles/App.css";

// ─── ERROR BOUNDARY ───────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error('ErrorBoundary:', error, info); }
  render() {
    if (this.state.hasError) return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20, textAlign:'center' }}>
        <h2>Terjadi kesalahan</h2>
        <button onClick={() => window.location.reload()} style={{ marginTop:16, padding:'12px 24px', background:'#C8102E', color:'white', border:'none', borderRadius:8, cursor:'pointer' }}>
          Refresh
        </button>
      </div>
    );
    return this.props.children;
  }
}

// ─── LAZY IMPORTS ─────────────────────────────────────────────────────────────
const LandingPage          = lazy(() => import("./components/LandingPage"));
const LoginPage            = lazy(() => import("./components/LoginPage"));
const SignupPage           = lazy(() => import("./components/SignupPage"));
const ForgotPasswordPage   = lazy(() => import("./components/ForgotPasswordPage"));
const ResetPasswordPage    = lazy(() => import("./components/ResetPasswordPage"));
const HomePage             = lazy(() => import("./components/HomePage"));
const BiodataPage          = lazy(() => import("./components/BiodataPage"));
const ConfirmPage          = lazy(() => import("./components/ConfirmPage"));
const NotificationsPage    = lazy(() => import("./components/NotificationsPage"));
const ProfilePage          = lazy(() => import("./components/ProfilePage"));
const PersonalInfoPage     = lazy(() => import("./components/PersonalInfoPage"));
const RiwayatReservasiPage = lazy(() => import("./components/RiwayatReservasiPage"));
const FAQPage              = lazy(() => import("./components/FAQPage"));
const PengaturanPage       = lazy(() => import("./components/PengaturanPage"));
const GantiAkunPage        = lazy(() => import("./components/GantiAkunPage"));
const LogoutPage           = lazy(() => import("./components/LogoutPage"));
const HealthAssistantPage  = lazy(() => import("./components/Healthassistantpage"));
const HealthModulePage     = lazy(() => import("./components/Healthmodulepage"));
const GymReservationPage   = lazy(() => import("./components/Gymreservationpage"));
const QRScanPage           = lazy(() => import("./components/QRScanPage"));

const PUBLIC_PAGES = ['landing', 'login', 'signup', 'forgot', 'reset-password'];

// ─── PAGE LOADER ──────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f5' }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <div style={{ width:32, height:32, border:'3px solid #eee', borderTopColor:'#C8102E', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
  </div>
);

// ─── MODULE-LEVEL URL PARSING ─────────────────────────────────────────────────
// Dibaca SEBELUM React render apapun — sinkron
// Ini penting agar hash fragment tidak hilang sebelum dibaca
const parseAuthUrl = () => {
  const hash   = window.location.hash.substring(1);
  const search = window.location.search.substring(1);
  const params = new URLSearchParams(hash || search);
  return {
    type:         params.get('type'),
    accessToken:  params.get('access_token'),
    refreshToken: params.get('refresh_token'),
    errorDesc:    params.get('error_description'),
  };
};

const AUTH_URL  = parseAuthUrl();
const IS_CB     = !!(AUTH_URL.accessToken && AUTH_URL.type);

console.log('[App] AUTH_URL:', AUTH_URL, '| IS_CB:', IS_CB);

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  // Kalau ini auth callback → skip loading screen & set halaman awal langsung
  const [appReady,    setAppReady]    = useState(IS_CB);
  const [showLoading, setShowLoading] = useState(!IS_CB);
  const [user,        setUser]        = useState(null);
  const [profile,     setProfile]     = useState(null);
  const [pageParams,  setPageParams]  = useState({});
  const [biodataTemp, setBiodataTemp] = useState(null);

  // Halaman awal: kalau recovery link → langsung reset-password
  const [page, setPage] = useState(() => {
    if (IS_CB && AUTH_URL.type === 'recovery') return 'reset-password';
    return 'landing';
  });

  const intervalRef    = useRef(null);
  const sessionHandled = useRef(false);

  // ─── NAVIGATE ───────────────────────────────────────────────────────────────
  const handleNavigate = (target, data = {}) => {
    if (target === page && Object.keys(data).length === 0) return;

    if (target === 'confirm' && data && Object.keys(data).length > 0) {
      setBiodataTemp(data);
    }
    if (target === 'home') {
      setBiodataTemp(null);
    }

    setPage(target);
    setPageParams(data && Object.keys(data).length > 0 ? data : {});

    if (!PUBLIC_PAGES.includes(target)) {
      sessionStorage.setItem('currentPage', target);
    } else {
      sessionStorage.removeItem('currentPage');
    }
  };

  // ─── LOADING FINISH ──────────────────────────────────────────────────────────
  const handleLoadingFinish = () => {
    if (appReady) { setShowLoading(false); return; }
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setAppReady(ready => {
        if (ready) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setShowLoading(false);
        }
        return ready;
      });
    }, 100);
  };

  // ─── PROFILE ─────────────────────────────────────────────────────────────────
  const fetchAndSetProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('nama_lengkap, email')
        .eq('id', userId)
        .single();
      if (data) setProfile(data);
      return !!(data?.nama_lengkap);
    } catch (err) {
      console.warn('fetchProfile failed:', err.message);
      return false;
    }
  };

  const navigateAfterAuth = async (userId, allowSavedPage = false) => {
    const hasBiodata = await fetchAndSetProfile(userId);
    let targetPage   = hasBiodata ? 'home' : 'biodata';
    if (allowSavedPage && hasBiodata) {
      const saved = sessionStorage.getItem('currentPage');
      if (saved && !PUBLIC_PAGES.includes(saved)) targetPage = saved;
    }
    setPage(targetPage);
    sessionStorage.setItem('currentPage', targetPage);
  };

  // ─── INIT ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const { type, accessToken, refreshToken, errorDesc } = AUTH_URL;

        if (IS_CB) {
          window.history.replaceState(null, '', window.location.pathname);
        }

        // Hanya handle recovery (reset password) dari URL
        if (type === 'recovery' && accessToken) {
          const { error } = await supabase.auth.setSession({
            access_token:  accessToken,
            refresh_token: refreshToken || '',
          });
          if (isMounted) {
            setPage(error ? 'login' : 'reset-password');
            setAppReady(true);
          }
          return;
        }

        // Error dari Supabase
        if (errorDesc) {
          if (isMounted) { setPage('login'); setAppReady(true); }
          return;
        }

        // Normal session check
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setUser(session?.user ?? null);
        if (session?.user) {
          sessionHandled.current = true;
          await navigateAfterAuth(session.user.id, true);
        } else {
          setProfile(null);
          setPage('landing');
          sessionStorage.removeItem('currentPage');
        }
      } catch (err) {
        console.error('[App] init failed:', err);
      } finally {
        if (isMounted && !IS_CB) setAppReady(true);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        console.log('[App] onAuthStateChange:', event);

        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          if (sessionHandled.current) { sessionHandled.current = false; return; }
          await navigateAfterAuth(session.user.id, false);
        } else if (event === 'PASSWORD_RECOVERY') {
          // Sudah dihandle via URL parsing di atas
          console.log('[App] PASSWORD_RECOVERY event (handled via URL)');
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setBiodataTemp(null);
          setPage('landing');
          sessionStorage.removeItem('currentPage');
        }
      }
    );

    return () => {
      isMounted = false;
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      subscription?.unsubscribe();
    };
  }, []);

  if (showLoading) return <LoadingScreen onFinish={handleLoadingFinish} />;

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Suspense fallback={<PageLoader />}>
          <div className="main-content">
            {page === 'landing'           && <LandingPage onNavigate={handleNavigate} />}
            {page === 'login'             && <LoginPage onNavigate={handleNavigate} />}
            {page === 'signup'            && <SignupPage onNavigate={handleNavigate} />}
            {page === 'forgot'            && <ForgotPasswordPage onNavigate={handleNavigate} />}
            {page === 'reset-password'    && <ResetPasswordPage onNavigate={handleNavigate} />}
            {page === 'home'              && <HomePage onNavigate={handleNavigate} user={user} />}
            {page === 'biodata'           && <BiodataPage onNavigate={handleNavigate} user={user} initialData={biodataTemp} />}
            {page === 'confirm'           && <ConfirmPage onNavigate={handleNavigate} biodata={biodataTemp} />}
            {page === 'notifications'     && <NotificationsPage onNavigate={handleNavigate} />}
            {page === 'profile'           && <ProfilePage onNavigate={handleNavigate} user={user} />}
            {page === 'personal-info'     && <PersonalInfoPage onNavigate={handleNavigate} user={user} />}
            {page === 'riwayat-reservasi' && <RiwayatReservasiPage onNavigate={handleNavigate} user={user} />}
            {page === 'faq'               && <FAQPage onNavigate={handleNavigate} />}
            {page === 'pengaturan'        && <PengaturanPage onNavigate={handleNavigate} />}
            {page === 'ganti-akun'        && <GantiAkunPage onNavigate={handleNavigate} user={user} profile={profile} />}
            {page === 'logout'            && <LogoutPage onNavigate={handleNavigate} />}
            {page === 'health-assistant'  && <HealthAssistantPage onNavigate={handleNavigate} user={user} />}
            {page === 'health-module'     && <HealthModulePage onNavigate={handleNavigate} user={user} />}
            {page === 'gym-reservation'   && <GymReservationPage onNavigate={handleNavigate} user={user} />}
            {page === 'qr-scan'           && <QRScanPage onNavigate={handleNavigate} user={user} params={pageParams} />}
          </div>
        </Suspense>
      </ToastProvider>
    </ErrorBoundary>
  );
}