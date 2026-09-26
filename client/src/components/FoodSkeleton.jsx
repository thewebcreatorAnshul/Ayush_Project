import React from 'react';

export const FoodSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 animate-skeleton flex flex-col space-y-4">
      <div className="aspect-[4/3] bg-slate-200 rounded-2xl w-full"></div>
      <div className="space-y-2">
        <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
        <div className="h-3 bg-slate-200 rounded-md w-full"></div>
        <div className="h-3 bg-slate-200 rounded-md w-2/3"></div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="h-6 bg-slate-200 rounded-md w-16"></div>
        <div className="h-9 bg-slate-200 rounded-xl w-20"></div>
      </div>
    </div>
  );
};
