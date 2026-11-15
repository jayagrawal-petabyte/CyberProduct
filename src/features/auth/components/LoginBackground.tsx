/**
 * BrainMint Login Background Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Faithfully reproduces the Figma approved ambient background:
 * - Soft pastel peach-pink to lavender canvas gradient
 * - Top-right layered dark aubergine & deep purple fluid curves
 * - Bottom-right layered purple curves with soft mauve contour
 * - Bottom-left slate blue & rose wave
 * - Left-side delicate harmonic contour lines
 */

import React from 'react';

export const LoginBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        background:
          'radial-gradient(circle at 12% 14%, #fae8df 0%, #f4dae5 32%, #e2bfd5 68%, #b892ad 100%)',
      }}
    >
      {/* ── Left-side Harmonic Contour Lines ────────────────────────────── */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '320px',
          height: '620px',
          opacity: 0.85,
        }}
        viewBox="0 0 320 620"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M -20 -10 C 60 70, 110 160, 100 270 C 90 380, 20 480, -20 540"
          stroke="rgba(88, 38, 76, 0.22)"
          strokeWidth="1.2"
        />
        <path
          d="M -30 20 C 70 100, 125 185, 115 290 C 105 395, 30 495, -20 560"
          stroke="rgba(88, 38, 76, 0.2)"
          strokeWidth="1.2"
        />
        <path
          d="M -40 50 C 75 130, 135 210, 125 310 C 115 410, 40 510, -20 580"
          stroke="rgba(88, 38, 76, 0.18)"
          strokeWidth="1.2"
        />
        <path
          d="M -50 80 C 80 160, 145 235, 135 330 C 125 425, 50 525, -20 600"
          stroke="rgba(88, 38, 76, 0.16)"
          strokeWidth="1.2"
        />
        <path
          d="M -60 110 C 85 190, 155 260, 145 350 C 135 440, 60 540, -10 620"
          stroke="rgba(88, 38, 76, 0.14)"
          strokeWidth="1.2"
        />
        <path
          d="M -70 140 C 90 220, 165 285, 155 370 C 145 455, 70 555, 0 640"
          stroke="rgba(88, 38, 76, 0.12)"
          strokeWidth="1.2"
        />
        <path
          d="M -80 170 C 95 250, 175 310, 165 390 C 155 470, 80 570, 10 660"
          stroke="rgba(88, 38, 76, 0.1)"
          strokeWidth="1.2"
        />
      </svg>

      {/* ── Top-Right Layered Purple & Aubergine Curves ───────────────────── */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '56vw',
          maxWidth: '680px',
          height: '42vh',
          maxHeight: '380px',
        }}
        viewBox="0 0 680 380"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft violet transition layer */}
        <path
          d="M 140 0 C 190 25, 260 45, 340 50 C 430 55, 490 120, 550 170 C 600 210, 640 215, 680 200 L 680 0 Z"
          fill="#5a226e"
          opacity="0.9"
        />
        {/* Deep rich purple layer */}
        <path
          d="M 240 0 C 290 35, 360 55, 430 65 C 500 75, 540 140, 590 185 C 630 220, 660 225, 680 215 L 680 0 Z"
          fill="#441a54"
        />
        {/* Darkest aubergine foreground curve */}
        <path
          d="M 360 0 C 410 40, 480 65, 530 85 C 570 100, 600 150, 640 190 C 660 205, 670 210, 680 210 L 680 0 Z"
          fill="#2b1538"
        />
        {/* Fine highlight contour along the wave edge */}
        <path
          d="M 140 0 C 190 25, 260 45, 340 50 C 430 55, 490 120, 550 170 C 600 210, 640 215, 680 200"
          stroke="rgba(216, 170, 205, 0.45)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      {/* ── Bottom-Right Layered Curves ──────────────────────────────────── */}
      <svg
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '54vw',
          maxWidth: '680px',
          height: '46vh',
          maxHeight: '440px',
        }}
        viewBox="0 0 680 440"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outermost soft mauve / rose curved ribbon */}
        <path
          d="M 680 180 C 560 170, 460 100, 360 115 C 230 135, 140 260, 0 350 L 0 440 L 680 440 Z"
          fill="#cda9c2"
          opacity="0.85"
        />
        {/* Deep magenta-purple layer */}
        <path
          d="M 680 210 C 570 200, 490 135, 400 150 C 280 170, 190 290, 80 440 L 680 440 Z"
          fill="#571680"
        />
        {/* Deep purple inner wave */}
        <path
          d="M 680 270 C 580 260, 520 205, 450 220 C 350 240, 280 340, 180 440 L 680 440 Z"
          fill="#401c5b"
        />
        {/* Subtle contour line over the rose wave */}
        <path
          d="M 680 180 C 560 170, 460 100, 360 115 C 230 135, 140 260, 0 350"
          stroke="rgba(255, 235, 245, 0.55)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      {/* ── Bottom-Left Slate Blue & Rose Curves ─────────────────────────── */}
      <svg
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '38vw',
          maxWidth: '460px',
          height: '38vh',
          maxHeight: '360px',
        }}
        viewBox="0 0 460 360"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft rose curve layer above the blue wave */}
        <path
          d="M 0 130 C 80 145, 140 210, 210 250 C 270 285, 330 305, 380 325 C 410 338, 435 350, 460 360 L 0 360 Z"
          fill="#cab4c7"
          opacity="0.8"
        />
        {/* Slate / dusty steel blue wave */}
        <path
          d="M 0 165 C 70 178, 125 235, 190 275 C 250 310, 305 328, 360 345 C 385 352, 410 357, 430 360 L 0 360 Z"
          fill="#8ba6c4"
        />
        {/* Lighter accent rim */}
        <path
          d="M 0 165 C 70 178, 125 235, 190 275 C 250 310, 305 328, 360 345 C 385 352, 410 357, 430 360"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  );
};
