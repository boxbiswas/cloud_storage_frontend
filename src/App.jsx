import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';

// Protected route wrapper
import ProtectedRoute from './components/ProtectedRoutes';

// Layout
import Sidebar from './components/layout/Sidebar';

// Pages
import Drive from './pages/Drive';
import Search from './pages/Search';
import Starred from './pages/Starred';
import Recent from './pages/Recent';
import Shared from './pages/Shared';
import Trash from './pages/Trash';

// Upload components (global, always mounted inside the authenticated layout)
import UploadTray from './components/upload/UploadTray';

// Public Link standalone page
import PublicLinkView from './pages/PublicLinkView';

/**
 * AppLayout — the authenticated shell (sidebar + main area).
 * Rendered via <Outlet /> by React Router — no nested <Routes> needed.
 */
const AppLayout = () => (
  <div className="flex h-screen overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-hidden flex flex-col">
      <Outlet />
    </main>
    <UploadTray />
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-cloud-50 bg-[radial-gradient(circle_at_15%_0%,rgba(47,111,237,0.06),transparent_45%)] font-body text-slate-700">
      <Routes>
        {/* ── Fully Public Routes (no auth check at all) ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Public Link view — standalone page, no sidebar, no auth required */}
        <Route path="/share/:token" element={<PublicLinkView />} />

        {/* ── Protected Routes ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Drive />} />
            <Route path="/search" element={<Search />} />
            <Route path="/starred" element={<Starred />} />
            <Route path="/recent" element={<Recent />} />
            <Route path="/shared" element={<Shared />} />
            <Route path="/trash" element={<Trash />} />
          </Route>
        </Route>

        {/* Catch-all → redirect to My Drive */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* ── Globals ── */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            borderRadius: '12px',
            border: '1px solid #DCE6F7',
            boxShadow: '0 10px 28px rgba(16,24,40,0.10)',
            maxWidth: '400px',
            wordBreak: 'break-word',
          },
        }}
      />
    </div>
  );
}

export default App;
