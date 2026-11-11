/**
 * BrainMint Table Primitives Component
 * CyberProduct Platform
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Lightweight, accessible table primitives styled to match Figma dashboard grids:
 * - Clean headers with uppercase or semi-bold labels
 * - Subtle border separators (#F0DFE6)
 * - Row hover highlights
 * - Empty state support
 */

import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  className = '',
  style,
  ...rest
}) => (
  <div style={{ width: '100%', overflowX: 'auto' }}>
    <table
      className={`brainmint-table ${className}`}
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-base, 0.875rem)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  style,
  ...rest
}) => (
  <thead
    className={`brainmint-table-header ${className}`}
    style={{
      borderBottom: '1.5px solid var(--color-border-subtle, #f0dfe6)',
      ...style,
    }}
    {...rest}
  >
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  style,
  ...rest
}) => (
  <tbody className={`brainmint-table-body ${className}`} style={style} {...rest}>
    {children}
  </tbody>
);

export const TableRow: React.FC<
  React.HTMLAttributes<HTMLTableRowElement> & { hoverable?: boolean }
> = ({ children, hoverable = true, className = '', style, ...rest }) => (
  <tr
    className={`brainmint-table-row ${className}`}
    style={{
      borderBottom: '1px solid var(--color-border-subtle, #f0dfe6)',
      transition: 'background-color var(--transition-fast)',
      cursor: hoverable ? 'default' : undefined,
      ...style,
    }}
    onMouseEnter={(e) => {
      if (hoverable) {
        e.currentTarget.style.backgroundColor = 'var(--color-bg-card-subtle, #fff8fa)';
      }
    }}
    onMouseLeave={(e) => {
      if (hoverable) {
        e.currentTarget.style.backgroundColor = 'transparent';
      }
    }}
    {...rest}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  style,
  ...rest
}) => (
  <th
    className={`brainmint-table-head ${className}`}
    style={{
      padding: '0.875rem 1rem',
      fontSize: 'var(--font-size-xs, 0.75rem)',
      fontWeight: 'var(--font-weight-semibold, 600)',
      color: 'var(--color-text-secondary, #6f5d6b)',
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
      ...style,
    }}
    {...rest}
  >
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  style,
  ...rest
}) => (
  <td
    className={`brainmint-table-cell ${className}`}
    style={{
      padding: '1rem',
      color: 'var(--color-text-body, #2a1b38)',
      verticalAlign: 'middle',
      fontSize: 'var(--font-size-base, 0.875rem)',
      ...style,
    }}
    {...rest}
  >
    {children}
  </td>
);

export const TableEmpty: React.FC<{ message?: string; colSpan: number }> = ({
  message = 'No records found',
  colSpan,
}) => (
  <tr>
    <td
      colSpan={colSpan}
      style={{
        padding: '3rem 1rem',
        textAlign: 'center',
        color: 'var(--color-text-muted, #9e8c96)',
        fontSize: 'var(--font-size-sm, 0.8125rem)',
      }}
    >
      {message}
    </td>
  </tr>
);
