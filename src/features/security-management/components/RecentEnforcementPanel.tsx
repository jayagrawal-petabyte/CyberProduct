/**
 * BrainMint — Recent Enforcement Panel
 * Scope: src/features/security-management/components/RecentEnforcementPanel.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Renders recent enforcement activity from the mock events data source
 * (title, description, timestamp, severity icon). ⚠️ These events are
 * fictional mock entries — nothing was actually blocked or remediated, and
 * this panel performs no enforcement.
 */

import React from 'react'
import type { EnforcementEventRecord, EnforcementSeverity } from '../types/networkCompliance.types'
import { Icon } from '../../../components/ui'
import './NetworkCompliancePanels.css'

interface RecentEnforcementPanelProps {
  events: EnforcementEventRecord[]
}

const SEVERITY_ICON: Record<EnforcementSeverity, 'x' | 'alert-triangle' | 'check-circle'> = {
  blocked: 'x',
  warning: 'alert-triangle',
  success: 'check-circle',
}

const EMPTY_WHEN = '—'

export const RecentEnforcementPanel: React.FC<RecentEnforcementPanelProps> = ({ events }) => {
  return (
    <section className="secpol-library secnet-event-card" aria-label="Recent enforcement activity">
      <div className="secpol-library-head">
        <h2 className="secpol-library-title">Recent Enforcement</h2>
        <p className="secpol-library-sub">
          Latest network enforcement activity · Development mock events only
        </p>
      </div>
      <ol className="secnet-events-list">
        {events.map((event) => (
          <li key={event.id} className="secnet-event">
            <span className={`secnet-event__icon secnet-event__icon--${event.severity}`} aria-hidden="true">
              <Icon name={SEVERITY_ICON[event.severity]} size={13} />
            </span>
            <div className="secnet-event__meta">
              <span className="secnet-event__title">{event.title}</span>
              <span className="secnet-event__desc">{event.description}</span>
              {event.zoneName && (
                <span className="secnet-event__zone">{event.zoneName}</span>
              )}
            </div>
            <span className="secnet-event__when">{event.timestamp ?? EMPTY_WHEN}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default RecentEnforcementPanel
