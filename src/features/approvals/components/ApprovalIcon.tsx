export type ApprovalIconName =
  | 'bell'
  | 'calendar'
  | 'check'
  | 'check-circle'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'clipboard'
  | 'clock'
  | 'grid'
  | 'key'
  | 'link'
  | 'lock'
  | 'monitor'
  | 'plus'
  | 'refresh'
  | 'search'
  | 'shield'
  | 'shield-check'
  | 'shield-alert'
  | 'activity'
  | 'user'
  | 'x'
  | 'x-circle'
  | 'edit'
  | 'save'
  | 'sun'
  | 'globe'
  | 'eye'
  | 'sliders'
  | 'arrow-left'

interface ApprovalIconProps {
  name: ApprovalIconName
  size?: number
  className?: string
}

export function ApprovalIcon({ name, size = 20, className }: ApprovalIconProps) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.8,
  }

  const content = (() => {
    switch (name) {
      case 'arrow-left':
        return (
          <>
            <line {...common} x1="19" y1="12" x2="5" y2="12" />
            <polyline {...common} points="12 19 5 12 12 5" />
          </>
        )
      case 'bell':
        return (
          <>
            <path {...common} d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path {...common} d="M10 21h4" />
          </>
        )
      case 'calendar':
        return (
          <>
            <rect {...common} x="3" y="4" width="18" height="17" rx="2" />
            <path {...common} d="M16 2v4M8 2v4M3 10h18" />
          </>
        )
      case 'check':
        return (
          <>
            <polyline {...common} points="20 6 9 17 4 12" />
          </>
        )
      case 'check-circle':
        return (
          <>
            <circle {...common} cx="12" cy="12" r="9" />
            <path {...common} d="m8 12 2.5 2.5L16 9" />
          </>
        )
      case 'chevron-down':
        return <path {...common} d="m6 9 6 6 6-6" />
      case 'chevron-left':
        return <path {...common} d="m14 6-6 6 6 6" />
      case 'chevron-right':
        return <path {...common} d="m10 6 6 6-6 6" />
      case 'clipboard':
        return (
          <>
            <rect {...common} x="5" y="4" width="14" height="17" rx="2" />
            <path {...common} d="M9 4V2h6v2M8 9h8M8 13h8M8 17h5" />
          </>
        )
      case 'clock':
        return (
          <>
            <circle {...common} cx="12" cy="12" r="9" />
            <path {...common} d="M12 7v5l3 2" />
          </>
        )
      case 'grid':
        return (
          <>
            <rect {...common} x="3" y="3" width="7" height="7" rx="1" />
            <rect {...common} x="14" y="3" width="7" height="7" rx="1" />
            <rect {...common} x="3" y="14" width="7" height="7" rx="1" />
            <rect {...common} x="14" y="14" width="7" height="7" rx="1" />
          </>
        )
      case 'key':
      case 'link':
        return (
          <>
            <circle {...common} cx="8" cy="15" r="4" />
            <path {...common} d="m10.8 12.2 7.2-7.2M15 5l4 4M17 3l2 2" />
          </>
        )
      case 'lock':
        return (
          <>
            <rect {...common} x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path {...common} d="M7 11V7a5 5 0 0 1 10 0v4" />
          </>
        )
      case 'monitor':
        return (
          <>
            <rect {...common} x="3" y="4" width="18" height="13" rx="2" />
            <path {...common} d="M8 21h8M12 17v4" />
          </>
        )
      case 'plus':
        return (
          <>
            <circle {...common} cx="12" cy="12" r="9" />
            <path {...common} d="M12 8v8M8 12h8" />
          </>
        )
      case 'refresh':
        return (
          <>
            <path {...common} d="M20 11a8 8 0 0 0-14.7-4L3 10" />
            <path {...common} d="M3 5v5h5M4 13a8 8 0 0 0 14.7 4L21 14" />
            <path {...common} d="M21 19v-5h-5" />
          </>
        )
      case 'search':
        return (
          <>
            <circle {...common} cx="10.5" cy="10.5" r="6.5" />
            <path {...common} d="m16 16 5 5" />
          </>
        )
      case 'shield':
      case 'shield-check':
        return (
          <>
            <path {...common} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path {...common} d="m9 12 2 2 4-4" />
          </>
        )
      case 'shield-alert':
        return (
          <>
            <path {...common} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line {...common} x1="12" y1="8" x2="12" y2="12" />
            <line {...common} x1="12" y1="16" x2="12.01" y2="16" />
          </>
        )
      case 'activity':
        return (
          <>
            <polyline {...common} points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </>
        )
      case 'user':
        return (
          <>
            <circle {...common} cx="12" cy="8" r="4" />
            <path {...common} d="M4 21a8 8 0 0 1 16 0" />
          </>
        )
      case 'x':
        return (
          <>
            <line {...common} x1="18" y1="6" x2="6" y2="18" />
            <line {...common} x1="6" y1="6" x2="18" y2="18" />
          </>
        )
      case 'x-circle':
        return (
          <>
            <circle {...common} cx="12" cy="12" r="9" />
            <path {...common} d="m9 9 6 6M15 9l-6 6" />
          </>
        )
      case 'edit':
        return (
          <>
            <path {...common} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path {...common} d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </>
        )
      case 'save':
        return (
          <>
            <path {...common} d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline {...common} points="17 21 17 13 7 13 7 21" />
            <polyline {...common} points="7 3 7 8 15 8" />
          </>
        )
      case 'sun':
        return (
          <>
            <circle {...common} cx="12" cy="12" r="5" />
            <line {...common} x1="12" y1="1" x2="12" y2="3" />
            <line {...common} x1="12" y1="21" x2="12" y2="23" />
            <line {...common} x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line {...common} x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line {...common} x1="1" y1="12" x2="3" y2="12" />
            <line {...common} x1="21" y1="12" x2="23" y2="12" />
            <line {...common} x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line {...common} x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </>
        )
      case 'globe':
        return (
          <>
            <circle {...common} cx="12" cy="12" r="10" />
            <line {...common} x1="2" y1="12" x2="22" y2="12" />
            <path {...common} d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </>
        )
      case 'eye':
        return (
          <>
            <path {...common} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle {...common} cx="12" cy="12" r="3" />
          </>
        )
      case 'sliders':
        return (
          <>
            <line {...common} x1="4" y1="21" x2="4" y2="14" />
            <line {...common} x1="4" y1="10" x2="4" y2="3" />
            <line {...common} x1="12" y1="21" x2="12" y2="12" />
            <line {...common} x1="12" y1="8" x2="12" y2="3" />
            <line {...common} x1="20" y1="21" x2="20" y2="16" />
            <line {...common} x1="20" y1="12" x2="20" y2="3" />
            <line {...common} x1="1" y1="14" x2="7" y2="14" />
            <line {...common} x1="9" y1="8" x2="15" y2="8" />
            <line {...common} x1="17" y1="16" x2="23" y2="16" />
          </>
        )
      default:
        return null
    }
  })()

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {content}
    </svg>
  )
}
