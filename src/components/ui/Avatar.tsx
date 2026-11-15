/**
 * BrainMint Avatar Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Supports user photo or initials fallback with pastel color palettes and active indicator.
 */

import React, { useState } from 'react';
import type { ComponentSize } from '../../types/ui';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: ComponentSize | 'xl';
  online?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  online,
  className = '',
  style,
  ...rest
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeDimensions: Record<ComponentSize | 'xl', { box: number; font: number; indicator: number }> = {
    sm: { box: 28, font: 11, indicator: 6 },
    md: { box: 38, font: 14, indicator: 8 },
    lg: { box: 54, font: 20, indicator: 11 },
    xl: { box: 76, font: 26, indicator: 14 },
  };

  const { box, font, indicator } = sizeDimensions[size];

  // Derive initials
  const initials = name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Consistent pastel background from name
  const pastelColors = [
    { bg: '#DDE7FF', text: '#2D5BD0' }, // soft blue (Alex Morgan)
    { bg: '#FCE7F3', text: '#BE185D' }, // soft pink
    { bg: '#E0E7FF', text: '#4338CA' }, // soft indigo
    { bg: '#EDE9FE', text: '#6D28D9' }, // soft purple
    { bg: '#D1FAE5', text: '#047857' }, // soft emerald
    { bg: '#FEF3C7', text: '#B45309' }, // soft amber
  ];

  const charCodeSum = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorPair = pastelColors[charCodeSum % pastelColors.length];

  return (
    <div
      className={`brainmint-avatar-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: `${box}px`,
        height: `${box}px`,
        flexShrink: 0,
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colorPair.bg,
          color: colorPair.text,
          fontWeight: 'var(--font-weight-bold, 700)',
          fontSize: `${font}px`,
          fontFamily: 'var(--font-sans)',
          userSelect: 'none',
          boxShadow: '0 2px 8px rgba(40, 26, 60, 0.08)',
        }}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={name}
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <span>{initials || '?'}</span>
        )}
      </div>

      {online !== undefined && (
        <span
          style={{
            position: 'absolute',
            bottom: '1px',
            right: '1px',
            width: `${indicator}px`,
            height: `${indicator}px`,
            borderRadius: '50%',
            backgroundColor: online
              ? 'var(--color-success, #10b981)'
              : 'var(--color-text-muted, #9e8c96)',
            border: '2px solid #ffffff',
          }}
        />
      )}
    </div>
  );
};
