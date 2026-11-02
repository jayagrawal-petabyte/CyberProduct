/**
 * BrainMint Container Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Provides responsive max-width layout with standard padding.
 */

import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Container: React.FC<ContainerProps> = ({
  maxWidth = 'xl',
  className = '',
  style,
  children,
  ...rest
}) => {
  const maxWidths = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1240px',
    full: '100%',
  };

  return (
    <div
      className={`brainmint-container ${className}`}
      style={{
        width: '100%',
        maxWidth: maxWidths[maxWidth],
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '1.25rem',
        paddingRight: '1.25rem',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};
