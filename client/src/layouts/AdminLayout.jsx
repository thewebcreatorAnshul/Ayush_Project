import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: UtensilsCrossed },
  { name: 'Categories', path: '/admin/categories', icon: Layers },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export const AdminLayout = () => {
  const { adminUser, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row antialiased font-sans">
      
      {/* Mobile Header Bar */}
      <header className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-30">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm shadow-amber-500/30">
            FD
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block">FeastDash Admin</span>
            <span className="text-[10px] text-amber-400 font-mono">Control Center</span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6 p-5">
          
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base shadow-md shadow-amber-500/20">
                FD
              </div>
              <div>
                <h1 className="font-black text-sm tracking-tight text-white">FeastDash</h1>
                <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Admin Gateway</span>
                </div>
              </div>
            </div>
          </div>

          {/* RBAC Security Banner */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RBAC ENFORCED</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              All administrative operations are verified on the backend.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 block">
              Management
            </span>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-40" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with Profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-900/50">
          
          {/* Quick link to customer storefront */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] font-semibold transition-colors"
          >
            <span>View Customer App</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          {/* Admin Profile & Logout */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400 flex-shrink-0">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{adminUser?.name || 'Administrator'}</p>
                <p className="text-[10px] text-amber-400/80 uppercase font-mono tracking-wider">Role: {adminUser?.role || 'admin'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              title="Logout from Admin Panel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Administrative Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-full lg:overflow-y-auto bg-slate-950">
        
        {/* Top Control Bar */}
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-3.5 hidden lg:flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Admin Console</span>
            <span>/</span>
            <span className="text-slate-200 font-semibold">FeastDash Portal</span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Backend RBAC Active</span>
            </div>
          </div>
        </div>

        {/* Page Outlet */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

    </div>
  );
};
