import { Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <div className="min-h-screen bg-cloud-50 bg-[radial-gradient(circle_at_15%_0%,rgba(47,111,237,0.06),transparent_45%)] font-body text-slate-700">
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Dedicated view for Public Links */}
        <Route path="/share/:token" element={<PublicLinkView />} />

        {/* ── Protected Routes (require authentication) ── */}
        <Route element={<ProtectedRoute />}>
          {/*
            All authenticated routes share the sidebar layout.
            The layout uses flex so the sidebar is always visible.
          */}
          <Route
            path="/*"
            element={
              <div className="flex h-screen overflow-hidden">
                {/* Persistent Sidebar */}
                <Sidebar />

                {/* Main content area fills remaining width */}
                <main className="flex-1 overflow-hidden flex flex-col">
                  <Routes>
                    {/* My Drive */}
                    <Route path="/" element={<Drive />} />

                    {/* Placeholder routes — implement in future days */}
                    <Route path="/search" element={<Search />} />
                    <Route path="/starred" element={<Starred />} />
                    <Route path="/recent"  element={<Recent />} />
                    <Route path="/shared"  element={<Shared />} />
                    <Route path="/trash"   element={<Trash />} />

                    {/* Catch-all → redirect to Drive */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            }
          />
        </Route>

        {/* Top-level catch-all */}
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

      {/* Upload progress tray — always on top */}
      <UploadTray />
    </div>
  );
}

// We can keep ComingSoon for any future stubs
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <div className="w-16 h-16 rounded-2xl bg-cloud-100 flex items-center justify-center mb-4">
      <span className="text-2xl">🚧</span>
    </div>
    <h2 className="font-display font-bold text-xl text-slate-900">{title}</h2>
    <p className="text-slate-500 text-sm mt-1">Coming soon</p>
  </div>
);

export default App;
