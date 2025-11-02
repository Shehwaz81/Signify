'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Signify
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link href="/emotion" className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                Emotion AI
              </Link>
              <Link href="/sign-language" className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                Sign Language
              </Link>
              <Link href="/real-time-sign" className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                Real-Time Sign
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
