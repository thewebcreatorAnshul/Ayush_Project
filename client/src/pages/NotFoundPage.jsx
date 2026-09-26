import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Utensils } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-24 h-24 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-4xl shadow-inner">
        404
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Page Not Found</h1>
        <p className="text-slate-500 text-sm">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <Link
          to="/menu"
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center space-x-2 transition-all"
        >
          <Utensils className="w-4 h-4" />
          <span>Explore Menu</span>
        </Link>
      </div>
    </div>
  );
};
