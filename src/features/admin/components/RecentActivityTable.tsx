import React, { useState } from 'react'
import { SecurityActivityRecord } from '../types/admin.types'
import { Card } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

interface RecentActivityTableProps {
  activities: SecurityActivityRecord[]
}

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({ activities }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('all')

  const filtered = activities.filter((act) => {
    if (filterSeverity !== 'all' && act.severity !== filterSeverity) return false
    if (
      searchTerm &&
      !act.eventType.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !act.actorName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !act.targetResource.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }
    return true
  })

  const getSeverityBadge = (severity: SecurityActivityRecord['severity']) => {
    switch (severity) {
      case 'critical':
        return <span className="admin-tag admin-tag--crit">CRITICAL</span>
      case 'high':
        return <span className="admin-tag admin-tag--high">HIGH</span>
      case 'medium':
        return <span className="admin-tag admin-tag--med">MED</span>
      case 'low':
      default:
        return <span className="admin-tag admin-tag--low">LOW</span>
    }
  }

  return (
    <Card className="admin-table-card" padding="none">
      {/* Table Header Controls */}
      <div className="admin-table-controls-bar">
        <div className="admin-search-wrap">
          <Icon name="search" size={16} className="admin-search-icon" />
          <input
            type="search"
            className="admin-search-input"
            placeholder="Search event, actor, or resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="admin-filter-select-group">
          <select
            className="admin-select"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            aria-label="Filter events by severity"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {searchTerm || filterSeverity !== 'all' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setFilterSeverity('all')
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      {/* Responsive Table */}
      <div className="admin-table-scroll-container">
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead style={{ width: '22%' }}>Event & Actor</TableHead>
              <TableHead style={{ width: '20%' }}>Target Resource</TableHead>
              <TableHead style={{ width: '26%' }}>Action Details</TableHead>
              <TableHead style={{ width: '12%' }}>Status</TableHead>
              <TableHead style={{ width: '8%' }}>Severity</TableHead>
              <TableHead style={{ width: '12%' }}>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow hoverable={false}>
                <TableCell colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <p style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>No security activities match filters</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Try resetting the search or severity criteria.</p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="admin-actor-cell">
                      <Avatar name={item.actorName} size="sm" />
                      <div className="admin-actor-info">
                        <strong className="admin-event-title">{item.eventType}</strong>
                        <span className="admin-actor-email">{item.actorName} • {item.actorEmail}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="admin-resource-info">
                      <span className="admin-category-badge">{item.resourceCategory}</span>
                      <strong className="admin-resource-title">{item.targetResource}</strong>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="admin-action-text">{item.actionDetails}</span>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={item.status} label={item.statusLabel} size="sm" />
                  </TableCell>

                  <TableCell>{getSeverityBadge(item.severity)}</TableCell>

                  <TableCell>
                    <span className="admin-timestamp-text">{item.timestamp}</span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table Footer */}
      <div className="admin-table-footer">
        <span className="admin-footer-count">
          Showing {filtered.length} of {activities.length} logged events
        </span>
        <span className="admin-footer-note">
          Simulated live event telemetry • SOC-2 certified audit pipeline
        </span>
      </div>
    </Card>
  )
}
