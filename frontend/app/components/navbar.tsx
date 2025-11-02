'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="nav-content">
        <Link href="/" className="nav-logo">
          Signify
        </Link>
        
        <div className="nav-links">
          <Link href="/" className="nav-link">
            Home
          </Link>
          <Link href="/emotion" className="nav-link">
            Emotion AI
          </Link>
          <Link href="/real-time-sign" className="nav-link">
            Real-Time Sign
          </Link>
        </div>
      </div>
    </nav>
  );
}