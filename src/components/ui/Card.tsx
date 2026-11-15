/**
 * BrainMint Card & SectionCard Components
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className = '',
  style,
  children,
  ...rest
}) => {
  const paddings = {
    none: '0',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'subtle':
        return {
          backgroundColor: 'var(--color-bg-card-subtle, #fff8fa)',
          border: '1px solid var(--color-border-subtle, #f0dfe6)',
        };
      case 'bordered':
        return {
          backgroundColor: 'var(--color-bg-card, #ffffff)',
          border: '1.5px solid var(--color-border-default, #e6d5dc)',
        };
      case 'default':
      default:
        return {
          backgroundColor: 'var(--color-bg-card, #ffffff)',
          border: '1px solid var(--color-border-subtle, #f0dfe6)',
        };
    }
  };

  return (
    <div
      className={`brainmint-card ${className}`}
      style={{
        borderRadius: 'var(--radius-xl, 20px)',
        boxShadow: 'var(--shadow-card)',
        padding: paddings[padding],
        transition: 'box-shadow var(--transition-base), transform var(--transition-base)',
        fontFamily: 'var(--font-sans)',
        ...getVariantStyles(),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  action,
  children,
  className = '',
  style,
  ...rest
}) => (
  <div
    className={`brainmint-card-header ${className}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      marginBottom: '1rem',
      ...style,
    }}
    {...rest}
  >
    <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>
    {action && <div style={{ flexShrink: 0 }}>{action}</div>}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  style,
  ...rest
}) => (
  <h3
    className={`brainmint-card-title ${className}`}
    style={{
      fontSize: 'var(--font-size-md, 1rem)',
      fontWeight: 'var(--font-weight-bold, 700)',
      color: 'var(--color-text-primary, #1e1229)',
      lineHeight: 1.25,
      ...style,
    }}
    {...rest}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  style,
  ...rest
}) => (
  <p
    className={`brainmint-card-description ${className}`}
    style={{
      fontSize: 'var(--font-size-xs, 0.75rem)',
      color: 'var(--color-text-secondary, #6f5d6b)',
      marginTop: '0.25rem',
      ...style,
    }}
    {...rest}
  >
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  style,
  ...rest
}) => (
  <div className={`brainmint-card-content ${className}`} style={style} {...rest}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  style,
  ...rest
}) => (
  <div
    className={`brainmint-card-footer ${className}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      marginTop: '1.25rem',
      paddingTop: '1rem',
      borderTop: '1px solid var(--color-border-subtle, #f0dfe6)',
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

export interface SectionCardProps extends Omit<CardProps, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  icon,
  action,
  children,
  ...cardProps
}) => {
  return (
    <Card {...cardProps}>
      <CardHeader
        action={action}
        style={{
          borderBottom: '1px solid var(--color-border-subtle, #f0dfe6)',
          paddingBottom: '0.875rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {icon && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: 'var(--color-brand-primary, #281a3c)',
              }}
            >
              {icon}
            </span>
          )}
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
