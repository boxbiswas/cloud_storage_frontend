import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import ProtectedRoute from './components/ProtectedRoutes';

function App() {
  return (
    <div className="min-h-screen bg-cloud-50 bg-[radial-gradient(circle_at_15%_0%,rgba(47,111,237,0.06),transparent_45%)] font-body text-slate-700">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Dashboard (Protected)</div>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
