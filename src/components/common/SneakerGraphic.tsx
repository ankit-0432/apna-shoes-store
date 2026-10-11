import React from 'react';
import { Product } from '../../types/store.js';

interface SneakerGraphicProps {
  type?: Product['graphicType'];
  accentColor?: string; // hex
  baseColor?: string;
  className?: string;
  animate?: boolean;
}

export const SneakerGraphic: React.FC<SneakerGraphicProps> = ({
  type = 'air-glide',
  accentColor = '#FF5A1F',
  baseColor = '#18181B',
  className = 'w-full h-full',
}) => {
  // SVG sneaker silhouette renderer tailored for Apna Shoes models
  return (
    <div className={`relative flex items-center justify-center select-none overflow-hidden ${className}`}>
      {/* Subtle background ambient studio pedestal glow */}
      <div 
        className="absolute w-4/5 h-16 rounded-full blur-2xl opacity-15 pointer-events-none -bottom-2"
        style={{ backgroundColor: accentColor }}
      />

      <svg
        viewBox="0 0 500 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          <linearGradient id={`grad-sole-${type}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#F4F4F5" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id={`grad-upper-${type}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={baseColor} />
            <stop offset="100%" stopColor="#27272A" />
          </linearGradient>

          <linearGradient id={`grad-accent-${type}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor="#FF7738" />
          </linearGradient>
        </defs>

        {/* Sneaker Ground Shadow */}
        <ellipse cx="250" cy="285" rx="190" ry="14" fill="#09090B" fillOpacity="0.22" />
        <ellipse cx="250" cy="285" rx="140" ry="8" fill="#09090B" fillOpacity="0.3" />

        {/* Render specific silhouette based on graphicType */}
        {type === 'high-top' ? (
          // High-Top Retro Dunk Silhouette
          <g transform="translate(30, 20)">
            {/* Outsole */}
            <path
              d="M 60 240 C 60 250 80 255 120 255 L 360 255 C 400 255 420 245 420 235 L 420 220 L 60 220 Z"
              fill={accentColor}
            />
            {/* Midsole */}
            <path
              d="M 55 220 C 55 235 75 242 110 242 L 370 242 C 405 242 425 232 425 220 L 420 205 L 60 205 Z"
              fill="#FFFFFF"
              stroke="#E4E4E7"
              strokeWidth="1.5"
            />
            {/* Midsole texture grooves */}
            <line x1="120" y1="210" x2="120" y2="238" stroke="#D4D4D8" strokeWidth="2" strokeLinecap="round" />
            <line x1="200" y1="210" x2="200" y2="238" stroke="#D4D4D8" strokeWidth="2" strokeLinecap="round" />
            <line x1="280" y1="210" x2="280" y2="238" stroke="#D4D4D8" strokeWidth="2" strokeLinecap="round" />

            {/* Upper Base - High Ankle Collar */}
            <path
              d="M 75 205 L 75 80 C 75 60 95 50 120 50 L 170 50 C 190 50 200 65 205 90 L 230 140 L 330 170 C 370 175 410 190 415 205 Z"
              fill={`url(#grad-upper-${type})`}
            />

            {/* Padded High-Top Collar Pill */}
            <path
              d="M 78 75 C 78 58 92 52 115 52 L 165 52 C 185 52 195 62 198 75 L 190 100 L 78 100 Z"
              fill="#27272A"
              stroke={accentColor}
              strokeWidth="2"
            />

            {/* Toe Box Overlay */}
            <path
              d="M 320 175 C 345 178 385 190 415 205 L 360 205 C 330 205 310 190 320 175 Z"
              fill={accentColor}
            />

            {/* Signature APNA Dynamic Chevron / Stripe */}
            <path
              d="M 120 185 L 210 135 L 320 170 L 300 185 L 215 155 L 130 202 Z"
              fill={accentColor}
            />

            {/* Lacing System */}
            <line x1="195" y1="95" x2="225" y2="135" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="205" y1="110" x2="245" y2="148" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="218" y1="125" x2="265" y2="160" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="230" y1="140" x2="285" y2="172" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />

            {/* Apna Shoes wordmark mini tag */}
            <rect x="90" y="65" width="45" height="12" rx="3" fill="#09090B" />
            <text x="112" y="74" fill="#FFFFFF" fontSize="6" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">APNA</text>
          </g>
        ) : type === 'aero-runner' || type === 'velocity-pro' ? (
          // Aeroflux Performance Running Shoe with Sculpted Wave Sole
          <g transform="translate(25, 25)">
            {/* Dynamic Sculpted Outsole with aggressive grip */}
            <path
              d="M 50 225 C 90 235 150 255 240 255 C 330 255 390 230 435 210 L 430 230 C 385 250 325 265 240 265 C 145 265 85 245 45 235 Z"
              fill={accentColor}
            />
            {/* Cushion Midsole with aerodynamic curves */}
            <path
              d="M 45 205 C 80 215 140 235 235 235 C 320 235 385 210 435 190 C 435 205 400 225 340 238 C 240 250 130 235 45 205 Z"
              fill={`url(#grad-sole-${type})`}
            />

            {/* Runner Upper Sleek Mesh */}
            <path
              d="M 60 195 C 60 145 100 120 140 120 C 160 120 180 135 210 150 L 320 170 C 370 175 410 185 430 192 L 415 198 C 360 205 180 215 60 195 Z"
              fill={`url(#grad-upper-${type})`}
            />

            {/* Aerodynamic Speed Slashes */}
            <path
              d="M 150 175 C 180 160 230 165 290 182 L 280 192 C 225 178 180 175 145 188 Z"
              fill={accentColor}
            />
            <path
              d="M 170 160 C 200 148 245 152 295 168 L 290 175 C 242 160 200 157 165 170 Z"
              fill="#FFFFFF"
              fillOpacity="0.8"
            />

            {/* Heel Tab */}
            <path
              d="M 62 145 C 55 135 55 125 65 120 C 72 120 75 130 72 140 Z"
              fill={accentColor}
            />

            {/* Speed Laces */}
            <line x1="175" y1="135" x2="205" y2="155" stroke="#E4E4E7" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="195" y1="145" x2="225" y2="162" stroke="#E4E4E7" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="215" y1="152" x2="245" y2="168" stroke="#E4E4E7" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ) : type === 'street-chunky' ? (
          // Chunky Architectural Street Sneaker
          <g transform="translate(25, 20)">
            {/* Massive Chunky Midsole Pods */}
            <path
              d="M 45 220 C 70 245 110 255 160 248 C 210 240 260 258 320 255 C 375 252 415 235 435 210 L 425 235 C 390 265 340 270 280 265 C 210 260 150 270 90 260 C 55 250 40 235 45 220 Z"
              fill="#18181B"
            />
            <path
              d="M 48 200 C 95 215 150 235 230 230 C 310 225 380 205 425 185 L 420 215 C 365 240 290 245 210 242 C 130 240 70 225 48 200 Z"
              fill="#F4F4F5"
              stroke="#E4E4E7"
              strokeWidth="2"
            />
            {/* Chunky Midsole Accent Cutouts */}
            <ellipse cx="140" cy="225" rx="20" ry="8" fill={accentColor} />
            <ellipse cx="250" cy="228" rx="22" ry="9" fill={accentColor} />
            <ellipse cx="340" cy="215" rx="18" ry="7" fill={accentColor} />

            {/* Upper Layers */}
            <path
              d="M 65 190 C 65 130 115 110 155 110 C 185 110 210 130 240 145 L 340 165 C 390 172 415 180 420 188 L 410 195 C 350 202 180 210 65 190 Z"
              fill={`url(#grad-upper-${type})`}
            />
            {/* Overlay Panels */}
            <path
              d="M 120 175 C 160 150 220 160 270 180 L 260 195 C 210 178 160 170 115 188 Z"
              fill={accentColor}
            />
            {/* Fast Lacing */}
            <line x1="180" y1="125" x2="220" y2="150" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <line x1="200" y1="135" x2="240" y2="160" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <line x1="220" y1="145" x2="260" y2="170" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          </g>
        ) : (
          // Default / Air Glide / Clean Street Silhouette
          <g transform="translate(25, 25)">
            {/* Outsole high traction layer */}
            <path
              d="M 55 228 C 90 238 160 248 245 248 C 330 248 395 235 435 215 L 430 232 C 385 250 320 260 240 260 C 150 260 85 248 50 235 Z"
              fill={accentColor}
            />

            {/* Midsole Sculpted EVA */}
            <path
              d="M 50 208 C 85 218 155 235 240 235 C 325 235 390 215 435 195 L 430 215 C 385 235 320 248 245 248 C 160 248 90 238 55 228 Z"
              fill={`url(#grad-sole-${type})`}
              stroke="#E4E4E7"
              strokeWidth="1"
            />

            {/* Air Bubble Window in Heel */}
            <rect x="90" y="214" width="40" height="10" rx="5" fill="#18181B" fillOpacity="0.8" />
            <rect x="92" y="215" width="36" height="8" rx="4" fill={accentColor} fillOpacity="0.4" />

            {/* Upper Shoe Body */}
            <path
              d="M 60 195 C 60 135 110 115 150 115 C 175 115 195 130 225 145 L 330 165 C 380 170 415 182 425 192 L 415 198 C 350 205 180 212 60 195 Z"
              fill={`url(#grad-upper-${type})`}
            />

            {/* Signature Apna Shoes Wing / Stripe */}
            <path
              d="M 130 178 C 170 152 230 158 290 175 L 275 188 C 225 174 175 170 125 188 Z"
              fill={accentColor}
            />

            {/* Toe Box Guard */}
            <path
              d="M 345 168 C 375 172 405 182 425 192 L 395 198 C 365 198 340 185 345 168 Z"
              fill="#27272A"
              stroke={accentColor}
              strokeWidth="1.5"
            />

            {/* Lacing Overlays */}
            <line x1="170" y1="130" x2="210" y2="152" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <line x1="190" y1="140" x2="230" y2="160" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <line x1="210" y1="148" x2="250" y2="168" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <line x1="230" y1="156" x2="270" y2="175" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

            {/* Brand Logo Stamp on Tongue */}
            <polygon points="152,118 160,126 156,128 164,136 150,132 154,124" fill={accentColor} />
          </g>
        )}
      </svg>
    </div>
  );
};
