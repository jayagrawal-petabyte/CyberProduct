import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'var(--color-bg-card, rgba(255,255,255,0.85))',
        border: '1px solid var(--color-border-subtle, rgba(239, 68, 68, 0.2))',
        borderRadius: '16px',
        padding: '3rem 2.5rem',
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.05), 0 8px 10px -6px rgba(239, 68, 68, 0.05)'
      }}>
        {/* Warning Icon Graphic */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          margin: '0 auto 1.5rem auto'
        }}>
          🛡️
        </div>

        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#dc2626',
          background: 'rgba(239, 68, 68, 0.08)',
          padding: '0.25rem 0.75rem',
          borderRadius: '999px'
        }}>
          Error 403 • Security Policy Enforcement
        </span>

        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--color-text-primary, #0f172a)',
          marginTop: '1rem',
          marginBottom: '0.75rem'
        }}>
          Access Denied
        </h1>

        <p style={{
          fontSize: '0.925rem',
          color: 'var(--color-text-secondary, #475569)',
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          Your current security context, network segment, or device posture does not meet the zero-trust compliance policy required to access this resource. This event has been logged for audit review.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '0.625rem 1.25rem',
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/security')}
            style={{
              padding: '0.625rem 1.25rem',
              background: 'var(--color-brand-primary, #4f46e5)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
            }}
          >
            Return to Security Center
          </button>
        </div>
      </div>
    </div>
  );
};
export default AccessDeniedPage;