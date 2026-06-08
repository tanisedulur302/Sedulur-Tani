'use client';

import React from 'react';

interface ComingSoonProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showContent?: boolean; // Whether to show blurred content or just the overlay
}

export default function ComingSoon({ 
  children, 
  title = "Segera Hadir",
  description = "Fitur ini sedang dalam pengembangan",
  showContent = true
}: ComingSoonProps) {
  return (
    <div className="relative">
      {/* Blurred Content */}
      {showContent && (
        <div className="blur-[2px] pointer-events-none select-none opacity-60">
          {children}
        </div>
      )}
      
      {/* Coming Soon Overlay */}
      <div className={`${showContent ? 'absolute inset-0' : ''} flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-xl min-h-[300px]`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 max-w-sm">{description}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Dalam Pengembangan
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Coming Soon Card (without blurred content behind)
export function ComingSoonCard({ 
  title = "Segera Hadir",
  description = "Fitur ini sedang dalam pengembangan"
}: { title?: string; description?: string }) {
  return (
    <div className="flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 rounded-xl min-h-[300px] border border-gray-200">
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 max-w-sm">{description}</p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Dalam Pengembangan
        </div>
      </div>
    </div>
  );
}
