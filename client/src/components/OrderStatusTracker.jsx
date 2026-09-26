import React, { memo } from 'react';
import { Check, Clock, Utensils, Bike, PackageCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
  { key: 'PLACED', title: 'Order Placed', desc: 'Received by system', icon: Clock },
  { key: 'CONFIRMED', title: 'Confirmed', desc: 'Kitchen acknowledged', icon: Utensils },
  { key: 'PREPARING', title: 'Preparing', desc: 'Chef cooking your meal', icon: Utensils },
  { key: 'PICKED UP', title: 'Picked Up', desc: 'Delivery partner on the way', icon: Bike },
  { key: 'DELIVERED', title: 'Delivered', desc: 'Arrived at your door', icon: PackageCheck }
];

export const OrderStatusTracker = memo(({ status, statusHistory = [] }) => {
  const currentStepIndex = STEPS.findIndex((s) => s.key === status);
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  const progressPercent = (activeIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="w-full bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-amber-500">Live Status Tracker</span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
            {STEPS[activeIndex]?.title || 'Processing'}
          </h3>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>{status === 'DELIVERED' ? 'Complete' : 'In Progress'}</span>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="relative mb-10">
        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500 -translate-y-1/2 rounded-full z-0"
        ></motion.div>

        {/* Step Nodes */}
        <div className="relative z-10 flex justify-between">
          {STEPS.map((step, index) => {
            const isDone = index < activeIndex;
            const isCurrent = index === activeIndex;
            const IconComponent = step.icon;

            const historyObj = statusHistory.find((h) => h.status === step.key);
            const formattedTime = historyObj
              ? new Date(historyObj.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : null;

            return (
              <div key={step.key} className="flex flex-col items-center group">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isCurrent ? 1.15 : 1 }}
                  className={`w-11 h-11 md:w-13 md:h-13 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100 shadow-amber-500/30'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-6 h-6 stroke-[3]" /> : <IconComponent className="w-5 h-5" />}
                </motion.div>

                <div className="text-center mt-3 hidden md:block max-w-[100px]">
                  <p className={`text-xs font-bold ${isCurrent ? 'text-slate-900' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                    {step.title}
                  </p>
                  {formattedTime && (
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      {formattedTime}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Step Labels */}
      <div className="md:hidden space-y-3 pt-2 border-t border-slate-100">
        {STEPS.map((step, index) => {
          const isDone = index < activeIndex;
          const isCurrent = index === activeIndex;
          const historyObj = statusHistory.find((h) => h.status === step.key);

          return (
            <div
              key={step.key}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs ${
                isCurrent
                  ? 'bg-amber-50 border border-amber-200 text-amber-900 font-bold'
                  : isDone
                  ? 'text-slate-700 font-medium'
                  : 'text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-amber-500' : isDone ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                <span>{step.title} - {step.desc}</span>
              </div>
              {historyObj && (
                <span className="text-[10px] text-slate-400">
                  {new Date(historyObj.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
