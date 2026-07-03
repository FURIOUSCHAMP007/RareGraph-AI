import { motion } from 'motion/react';

export default function PageSkeleton() {
  return (
    <div className="w-full h-full space-y-8 animate-pulse p-8">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-4">
          <div className="h-8 w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-12 w-32 bg-slate-200 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl" />
            <div className="h-4 w-20 bg-slate-50 rounded" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[400px] bg-white border border-slate-100 rounded-3xl" />
        <div className="h-[400px] bg-slate-900 rounded-3xl" />
      </div>

      <div className="h-64 bg-white border border-slate-100 rounded-3xl" />
    </div>
  );
}
