
import React from 'react';

const Lantern: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`floating ${className}`}>
    <svg width="60" height="80" viewBox="0 0 60 80">
      <rect x="25" y="0" width="10" height="10" fill="#FFD700" />
      <ellipse cx="30" cy="40" rx="25" ry="30" fill="#D90429" stroke="#FFD700" strokeWidth="2" />
      <line x1="15" y1="20" x2="15" y2="60" stroke="#FFD700" strokeWidth="1" opacity="0.5" />
      <line x1="30" y1="10" x2="30" y2="70" stroke="#FFD700" strokeWidth="1" opacity="0.5" />
      <line x1="45" y1="20" x2="45" y2="60" stroke="#FFD700" strokeWidth="1" opacity="0.5" />
      <rect x="20" y="70" width="20" height="10" fill="#FFD700" />
      <path d="M25 80 L25 90 M30 80 L30 95 M35 80 L35 90" stroke="#FFD700" strokeWidth="2" />
    </svg>
  </div>
);

export default Lantern;
