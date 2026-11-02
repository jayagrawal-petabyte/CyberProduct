export type ApprovalIconName =
  | 'bell'
  | 'calendar'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'clipboard'
  | 'clock'
  | 'grid'
  | 'monitor'
  | 'plus'
  | 'refresh'
  | 'search'
  | 'user'
  | 'x'

interface ApprovalIconProps {
  name: ApprovalIconName
  size?: number
  className?: string
}

export function ApprovalIcon({ name, size = 20, className }: ApprovalIconProps) {
  const common = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 1.8 }

  const content = (() => {
    switch (name) {
      case 'bell': return <><path {...common} d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path {...common} d="M10 21h4" /></>
      case 'calendar': return <><rect {...common} x="3" y="4" width="18" height="17" rx="2" /><path {...common} d="M16 2v4M8 2v4M3 10h18" /></>
      case 'check': return <><circle {...common} cx="12" cy="12" r="9" /><path {...common} d="m8 12 2.5 2.5L16 9" /></>
      case 'chevron-down': return <path {...common} d="m6 9 6 6 6-6" />
      case 'chevron-left': return <path {...common} d="m14 6-6 6 6 6" />
      case 'chevron-right': return <path {...common} d="m10 6 6 6-6 6" />
      case 'clipboard': return <><rect {...common} x="5" y="4" width="14" height="17" rx="2" /><path {...common} d="M9 4V2h6v2M8 9h8M8 13h8M8 17h5" /></>
      case 'clock': return <><circle {...common} cx="12" cy="12" r="9" /><path {...common} d="M12 7v5l3 2" /></>
      case 'grid': return <><rect {...common} x="3" y="3" width="7" height="7" rx="1" /><rect {...common} x="14" y="3" width="7" height="7" rx="1" /><rect {...common} x="3" y="14" width="7" height="7" rx="1" /><rect {...common} x="14" y="14" width="7" height="7" rx="1" /></>
      case 'monitor': return <><rect {...common} x="3" y="4" width="18" height="13" rx="2" /><path {...common} d="M8 21h8M12 17v4" /></>
      case 'plus': return <><circle {...common} cx="12" cy="12" r="9" /><path {...common} d="M12 8v8M8 12h8" /></>
      case 'refresh': return <><path {...common} d="M20 11a8 8 0 0 0-14.7-4L3 10" /><path {...common} d="M3 5v5h5M4 13a8 8 0 0 0 14.7 4L21 14" /><path {...common} d="M21 19v-5h-5" /></>
      case 'search': return <><circle {...common} cx="10.5" cy="10.5" r="6.5" /><path {...common} d="m16 16 5 5" /></>
      case 'user': return <><circle {...common} cx="12" cy="8" r="4" /><path {...common} d="M4 21a8 8 0 0 1 16 0" /></>
      case 'x': return <><circle {...common} cx="12" cy="12" r="9" /><path {...common} d="m9 9 6 6M15 9l-6 6" /></>
    }
  })()

  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">{content}</svg>
}
