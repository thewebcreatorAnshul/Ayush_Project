import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Heart, ShieldCheck, Truck, Clock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value props banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-800 text-slate-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Superfast Delivery</h4>
              <p className="text-xs text-slate-400">Hot gourmet meals delivered under 35 mins</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">100% Quality Hygiene</h4>
              <p className="text-xs text-slate-400">Hand-crafted by top certified local chefs</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Live Order Tracking</h4>
              <p className="text-xs text-slate-400">Real-time dynamic status & delivery updates</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Feast<span className="text-amber-500">Dash</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Elevating food delivery with restaurant-grade quality, instant live order tracking, and effortless gourmet ordering.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h5 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Home Page</Link></li>
              <li><Link to="/menu" className="hover:text-amber-400 transition-colors">Explore Full Menu</Link></li>
              <li><Link to="/cart" className="hover:text-amber-400 transition-colors">View Food Cart</Link></li>
              <li><Link to="/profile" className="hover:text-amber-400 transition-colors">Track Orders</Link></li>
            </ul>
          </div>

          {/* Column 3: Food Categories */}
          <div>
            <h5 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Popular Categories</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/menu?category=Burgers" className="hover:text-amber-400 transition-colors">Artisanal Burgers</Link></li>
              <li><Link to="/menu?category=Pizza" className="hover:text-amber-400 transition-colors">Woodfired Pizzas</Link></li>
              <li><Link to="/menu?category=Asian" className="hover:text-amber-400 transition-colors">Asian Ramen & Bowls</Link></li>
              <li><Link to="/menu?category=Desserts" className="hover:text-amber-400 transition-colors">Decadent Desserts</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Hours */}
          <div>
            <h5 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Service Hours</h5>
            <p className="text-sm mb-2"><strong className="text-white">Monday - Sunday:</strong> 10:00 AM - 11:30 PM</p>
            <p className="text-sm"><strong className="text-white">Support Hotline:</strong> +1 (800) 555-DASH</p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs flex flex-col sm:flex-row items-center justify-between">
          <p>© {new Date().getFullYear()} FeastDash Food Delivery Inc. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for food lovers</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
