'use client';

import { useEffect } from 'react';

interface AlertProps {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
}

export default function Alert({ title, message, type = 'info', onClose }: AlertProps) {
  useEffect(() => {
    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'text-blue-900',
      message: 'text-blue-700',
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      title: 'text-emerald-900',
      message: 'text-emerald-700',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      iconBg: 'bg-amber-100',
      title: 'text-amber-900',
      message: 'text-amber-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      iconBg: 'bg-red-100',
      title: 'text-red-900',
      message: 'text-red-700',
    },
  };

  const style = styles[type];

  const icons = {
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Alert Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div 
          className={`${style.bg} ${style.border} border-2 rounded-2xl shadow-2xl max-w-md w-full p-6 pointer-events-auto animate-in zoom-in-95 fade-in duration-200`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`${style.iconBg} ${style.icon} rounded-full p-3 shrink-0`}>
              {icons[type]}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold ${style.title} mb-2`}>
                {title}
              </h3>
              <p className={`text-sm ${style.message} leading-relaxed whitespace-pre-line`}>
                {message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`${style.icon} hover:opacity-70 transition-opacity shrink-0`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Action Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className={`px-6 py-2.5 ${style.iconBg} ${style.icon} rounded-xl font-semibold hover:opacity-80 transition-opacity`}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
