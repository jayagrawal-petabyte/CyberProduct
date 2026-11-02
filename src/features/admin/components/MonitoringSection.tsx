import React from 'react'
import {
  NetworkComplianceData,
  DevicePostureData,
  AccessDemandData,
  PolicyViolationSummaryData,
} from '../types/admin.types'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface MonitoringSectionProps {
  network: NetworkComplianceData
  devices: DevicePostureData
  accessDemand: AccessDemandData
  violations: PolicyViolationSummaryData
}

export const MonitoringSection: React.FC<MonitoringSectionProps> = ({
  network,
  devices,
  accessDemand,
  violations,
}) => {
  return (
    <div className="admin-monitoring-grid">
      {/* 1. Network Compliance Overview */}
      <Card className="admin-subcard" padding="md">
        <div className="admin-subcard-header">
          <div className="admin-subcard-title-group">
            <span className="admin-icon-bubble admin-icon-bubble--blue">
              <Icon name="shield-check" size={18} />
            </span>
            <div>
              <h3 className="admin-subcard-title">Network Compliance</h3>
              <p className="admin-subcard-subtitle">Zero-trust gateways & VPC subnets</p>
            </div>
          </div>
          <StatusBadge status="compliant" label={`${network.complianceScore}% Enforced`} />
        </div>

        <div className="admin-subcard-body">
          <div className="admin-progress-block">
            <div className="admin-progress-label-row">
              <span>Gateway TLS & Tunnel Health</span>
              <span className="admin-progress-value-text">{network.gatewayTlsPercent}%</span>
            </div>
            <div className="admin-progress-track">
              <div
                className="admin-progress-fill admin-progress-fill--green"
                style={{ width: `${network.gatewayTlsPercent}%` }}
              />
            </div>
          </div>

          <div className="admin-stat-pills-row">
            <div className="admin-stat-pill">
              <span className="admin-stat-pill-num">{network.activeGateways} / {network.totalGateways}</span>
              <span className="admin-stat-pill-label">Gateways Active</span>
            </div>
            <div className="admin-stat-pill">
              <span className="admin-stat-pill-num">{network.isolatedSubnets}</span>
              <span className="admin-stat-pill-label">Isolated Subnets</span>
            </div>
          </div>

          <div className="admin-breakdown-list">
            {network.gateways.map((item, idx) => (
              <div key={idx} className="admin-breakdown-item">
                <div className="admin-breakdown-left">
                  <span
                    className={`admin-dot ${
                      item.status === 'compliant'
                        ? 'admin-dot--green'
                        : 'admin-dot--amber'
                    }`}
                  />
                  <span className="admin-breakdown-name">{item.name}</span>
                </div>
                <div className="admin-breakdown-right">
                  <span className="admin-breakdown-percent">{item.compliancePercent}%</span>
                  <span className="admin-breakdown-count">({item.activeGateways} nodes)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 2. Device Compliance Posture */}
      <Card className="admin-subcard" padding="md">
        <div className="admin-subcard-header">
          <div className="admin-subcard-title-group">
            <span className="admin-icon-bubble admin-icon-bubble--purple">
              <Icon name="monitor" size={18} />
            </span>
            <div>
              <h3 className="admin-subcard-title">Device Compliance</h3>
              <p className="admin-subcard-subtitle">Endpoint EDR, encryption & posture</p>
            </div>
          </div>
          <span className="admin-neutral-pill">{devices.totalDevices.toLocaleString()} Devices</span>
        </div>

        <div className="admin-subcard-body">
          {/* Multi-segment Meter */}
          <div className="admin-meter-bar">
            <div
              className="admin-meter-segment admin-meter-segment--green"
              style={{ width: `${(devices.compliantCount / devices.totalDevices) * 100}%` }}
              title={`Compliant: ${devices.compliantCount}`}
            />
            <div
              className="admin-meter-segment admin-meter-segment--amber"
              style={{ width: `${(devices.pendingCount / devices.totalDevices) * 100}%` }}
              title={`Pending: ${devices.pendingCount}`}
            />
            <div
              className="admin-meter-segment admin-meter-segment--red"
              style={{ width: `${(devices.criticalCount / devices.totalDevices) * 100}%` }}
              title={`Critical: ${devices.criticalCount}`}
            />
          </div>

          <div className="admin-meter-legend">
            <div className="admin-legend-item">
              <span className="admin-swatch admin-swatch--green" />
              <span>Compliant ({devices.compliantCount})</span>
            </div>
            <div className="admin-legend-item">
              <span className="admin-swatch admin-swatch--amber" />
              <span>Pending ({devices.pendingCount})</span>
            </div>
            <div className="admin-legend-item">
              <span className="admin-swatch admin-swatch--red" />
              <span>Critical ({devices.criticalCount})</span>
            </div>
          </div>

          <div className="admin-breakdown-list">
            {devices.osList.map((osItem, idx) => (
              <div key={idx} className="admin-breakdown-item">
                <span className="admin-breakdown-name">{osItem.osName}</span>
                <div className="admin-breakdown-right">
                  <span className="admin-breakdown-percent">{osItem.compliancePercent}%</span>
                  <span className="admin-breakdown-count">({osItem.deviceCount})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 3. Access Demand Overview */}
      <Card className="admin-subcard" padding="md">
        <div className="admin-subcard-header">
          <div className="admin-subcard-title-group">
            <span className="admin-icon-bubble admin-icon-bubble--amber">
              <Icon name="clock" size={18} />
            </span>
            <div>
              <h3 className="admin-subcard-title">Access Requests</h3>
              <p className="admin-subcard-subtitle">Elevated permissions & approvals</p>
            </div>
          </div>
          <StatusBadge status="pending" label="Requires Review" />
        </div>

        <div className="admin-subcard-body">
          <div className="admin-stat-pills-row">
            <div className="admin-stat-pill">
              <span className="admin-stat-pill-num admin-stat-pill-num--amber">
                {accessDemand.pendingReviewCount}
              </span>
              <span className="admin-stat-pill-label">Pending Lead</span>
            </div>
            <div className="admin-stat-pill">
              <span className="admin-stat-pill-num">{accessDemand.autoApprovedTodayCount}</span>
              <span className="admin-stat-pill-label">Auto-Approved Today</span>
            </div>
            <div className="admin-stat-pill">
              <span className="admin-stat-pill-num">{accessDemand.avgResponseTimeHours}h</span>
              <span className="admin-stat-pill-label">Avg Turnaround</span>
            </div>
          </div>

          <div className="admin-section-caption">High-Demand Resource Classes</div>
          <div className="admin-breakdown-list">
            {accessDemand.resourceClasses.map((item, idx) => (
              <div key={idx} className="admin-breakdown-item">
                <span className="admin-breakdown-name">{item.category}</span>
                <span className="admin-count-pill">{item.activeRequests} requests</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 4. Policy Violations Summary */}
      <Card className="admin-subcard" padding="md">
        <div className="admin-subcard-header">
          <div className="admin-subcard-title-group">
            <span className="admin-icon-bubble admin-icon-bubble--red">
              <Icon name="alert-triangle" size={18} />
            </span>
            <div>
              <h3 className="admin-subcard-title">Policy Violations</h3>
              <p className="admin-subcard-subtitle">Zero-trust rule breaches (24h)</p>
            </div>
          </div>
          <StatusBadge
            status="rejected"
            label={`${violations.criticalCount + violations.highCount + violations.mediumCount + violations.lowCount} Total`}
          />
        </div>

        <div className="admin-subcard-body">
          <div className="admin-severity-grid">
            <div className="admin-severity-box admin-severity-box--crit">
              <span className="admin-severity-num">{violations.criticalCount}</span>
              <span className="admin-severity-label">Critical</span>
            </div>
            <div className="admin-severity-box admin-severity-box--high">
              <span className="admin-severity-num">{violations.highCount}</span>
              <span className="admin-severity-label">High</span>
            </div>
            <div className="admin-severity-box admin-severity-box--med">
              <span className="admin-severity-num">{violations.mediumCount}</span>
              <span className="admin-severity-label">Medium</span>
            </div>
            <div className="admin-severity-box admin-severity-box--low">
              <span className="admin-severity-num">{violations.lowCount}</span>
              <span className="admin-severity-label">Low</span>
            </div>
          </div>

          <div className="admin-callout-card">
            <span className="admin-callout-tag">Top Trigger:</span>
            <span className="admin-callout-text">{violations.topTriggerPolicy}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
