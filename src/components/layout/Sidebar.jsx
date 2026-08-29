import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HardDrive, Users, Star, Trash2, ChevronRight, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import api from '../../https/axios';
import toast from 'react-hot-toast';

/**
 * Sidebar
 * Main navigation sidebar for CloudVault.
 * Uses NavLink for active-state styling.
 * Routes planned: /, /shared, /starred, /trash
 *
 * Props:
 *   className - additional Tailwind classes (for responsive hiding)
 */
const Sidebar = ({ className = '' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const navItems = [
    { to: '/',        icon: <HardDrive size={17} />,  label: 'My Drive',        end: true },
    { to: '/shared',  icon: <Users size={17} />,       label: 'Shared with me'  },
    { to: '/starred', icon: <Star size={17} />,        label: 'Starred'         },
    { to: '/trash',   icon: <Trash2 size={17} />,      label: 'Trash'           },
  ];

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logout());
      sessionStorage.removeItem('sessionid');
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <aside
      className={`
        flex flex-col gap-1 w-56 shrink-0 py-4 px-3
        border-r border-cloud-200 bg-white/60 backdrop-blur-glass
        ${className}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-azure-500 flex items-center justify-center shadow-raised">
          <HardDrive size={16} className="text-white" />
        </div>
        <span className="font-display font-bold text-slate-900 text-base tracking-tight">CloudVault</span>
      </div>

      {/* Primary navigation */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map(({ to, icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-150 group
              ${isActive
                ? 'bg-azure-100/70 text-azure-600 font-semibold'
                : 'text-slate-600 hover:bg-cloud-100 hover:text-slate-900'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <span className={`transition-colors ${isActive ? 'text-azure-500' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {icon}
                </span>
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={13} className="text-azure-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        {/* Storage usage indicator (static for now) */}
        <div className="mx-1 p-3 rounded-xl bg-cloud-50 border border-cloud-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-xs font-medium text-slate-600">Storage</span>
            <span className="font-mono text-[10px] text-slate-400">0 / 15 GB</span>
          </div>
          <div className="h-1.5 rounded-full bg-cloud-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-azure-500 transition-all duration-500"
              style={{ width: '0%' }}
            />
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center justify-between mx-1 p-2 rounded-xl border border-transparent hover:border-cloud-200 hover:bg-cloud-50 transition-colors">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-cloud-200 shrink-0 flex items-center justify-center overflow-hidden">
              {user?.image_url ? (
                <img src={user.image_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-semibold text-slate-500 text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'User'}</span>
              <span className="text-[10px] text-slate-500 truncate">{user?.email || ''}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-coral-500 hover:bg-coral-50 transition-colors shrink-0"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
