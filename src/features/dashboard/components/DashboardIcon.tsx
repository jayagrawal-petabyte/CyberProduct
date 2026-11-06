export type DashboardIconName =
  | 'clock'
  | 'check'
  | 'x'
  | 'users'
  | 'shield-check'
  | 'file-text'
  | 'alert-triangle'
  | 'refresh'
  | 'home'
  | 'grid'
  | 'monitor'
  | 'plus'
  | 'clipboard'
  | 'bell'
  | 'user'

interface DashboardIconProps {
  name: DashboardIconName
  size?: number
  className?: string
  strokeWidth?: number
}

export function DashboardIcon({ name, size = 20, className, strokeWidth = 2 }: DashboardIconProps) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth,
  }

  const content = (() => {
    switch (name) {
      case 'clock':
        return (
          <>
            <circle {...common} cx="12" cy="12" r="9" />
            <path {...common} d="M12 7v5l3 2" />
          </>
        )
      case 'check':
        return (
          <>
            <circle {...common} cx="12" cy="12" r="9" />
            <path {...common} d="m8 12 2.5 2.5L16 9" />
          </>
        )
      case 'x':
        return (
          <>
            <circle {...common} cx="12" cy="12" r="9" />
            <path {...common} d="m9 9 6 6M15 9l-6 6" />
          </>
        )
      case 'users':
        return (
          <>
            <path {...common} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle {...common} cx="9" cy="7" r="4" />
            <path {...common} d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path {...common} d="M16 3.13a4 4 0 0 1 0 7.75" />
          </>
        )
      case 'shield-check':
        return (
          <>
            <path {...common} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline {...common} points="9 12 11 14 15 10" />
          </>
        )
      case 'file-text':
        return (
          <>
            <path {...common} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline {...common} points="14 2 14 8 20 8" />
            <line {...common} x1="16" y1="13" x2="8" y2="13" />
            <line {...common} x1="16" y1="17" x2="8" y2="17" />
          </>
        )
      case 'alert-triangle':
        return (
          <>
            <path
              {...common}
              d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
            />
            <line {...common} x1="12" y1="9" x2="12" y2="13" />
            <line {...common} x1="12" y1="17" x2="12.01" y2="17" />
          </>
        )
      case 'refresh':
        return (
          <>
            <path {...common} d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path {...common} d="M21 3v5h-5" />
            <path {...common} d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path {...common} d="M8 16H3v5" />
          </>
        )
      case 'home':
        return (
          <>
            <path {...common} d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline {...common} points="9 22 9 12 15 12 15 22" />
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
      case 'monitor':
        return (
          <>
            <rect {...common} x="2" y="3" width="20" height="14" rx="2" />
            <line {...common} x1="8" y1="21" x2="16" y2="21" />
            <line {...common} x1="12" y1="17" x2="12" y2="21" />
          </>
        )
      case 'plus':
        return (
          <>
            <circle {...common} cx="12" cy="12" r="9" />
            <path {...common} d="M12 8v8M8 12h8" />
          </>
        )
      case 'clipboard':
        return (
          <>
            <rect {...common} x="5" y="4" width="14" height="17" rx="2" />
            <path {...common} d="M9 4V2h6v2M8 9h8M8 13h8M8 17h5" />
          </>
        )
      case 'bell':
        return (
          <>
            <path {...common} d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path {...common} d="M10 21h4" />
          </>
        )
      case 'user':
        return (
          <>
            <circle {...common} cx="12" cy="8" r="4" />
            <path {...common} d="M4 21a8 8 0 0 1 16 0" />
          </>
        )
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
