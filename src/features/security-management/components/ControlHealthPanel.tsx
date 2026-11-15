/**
 * BrainMint — Control Health Panel
 * Scope: src/features/security-management/components/ControlHealthPanel.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * Renders the five network security controls as a list with data-driven
 * progress bars (green healthy / amber watch / red at-risk). Values come
 * from the mock control dataset; this panel enforces nothing.
 */

import React from 'react'
import type { ControlState, NetworkControlRecord } from '../types/networkCompliance.types'
import { CONTROL_STATE_LABELS } from '../types/networkCompliance.types'
import './NetworkCompliancePanels.css'

interface ControlHealthPanelProps {
  controls: NetworkControlRecord[]
}

const STATE_DOTTED_CLASS: Record<ControlState, string> = {
  healthy: 'secnet-state-dotted--healthy',
  watch: 'secnet-state-dotted--watch',
  'at-risk': 'secnet-state-dotted--at-risk',
}

export const ControlHealthPanel: React.FC<ControlHealthPanelProps> = ({ controls }) => {
  return (
    <section className="secpol-library secnet-control-card" aria-label="Security control health">
      <div className="secpol-library-head">
        <h2 className="secpol-library-title">Control Health</h2>
        <p className="secpol-library-sub">
          Grouped network security control coverage · Mock values, not live telemetry
        </p>
      </div>
      <ol className="secnet-controls-list">
        {controls.map((control) => (
          <li key={control.id} className="secnet-control">
            <div>
              <div className="secnet-control__meta">
                <span className="secnet-control__name">{control.name}</span>
              </div>
              <span className="secnet-control__desc">{control.description}</span>
            </div>
            <div className="secnet-control__gauge">
              <span
                className={`secnet-progress secnet-progress--${control.state}`}
                role="img"
                aria-label={`${control.name} ${control.valuePct} percent`}
              >
                <span style={{ width: `${control.valuePct}%` }} />
              </span>
              <span className="secnet-progress-value">{control.valuePct}%</span>
              <span className={`secnet-state-dotted ${STATE_DOTTED_CLASS[control.state]}`}>
                <span className="secnet-status-dot" aria-hidden="true" />
                {CONTROL_STATE_LABELS[control.state]}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default ControlHealthPanel
