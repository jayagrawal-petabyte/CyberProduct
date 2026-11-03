import React from 'react';
import { PageLayout, MetricCard } from '../../../components/shared';
import { PageHeader, Icon } from '../../../components/ui';
import { useNavigate } from 'react-router-dom';
const EmployeeDashboardPage: React.FC = () => {
    const navigate = useNavigate();
  return (
    <PageLayout activeDockId="dashboard" showDock={true}>

      {/* 1. Page Heading */}
      <PageHeader
        title="Employee Dashboard"
        description="Welcome to your CyberProduct employee portal."
      />

      {/* 2. Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '24px' }}>
        <MetricCard title="Assigned Devices" value={3} subtext="Devices assigned to you" icon={<Icon name="monitor" size={24} />} />
        <MetricCard title="Pending Requests" value={2} subtext="Awaiting approval" icon={<Icon name="clock" size={24} />} />
        <MetricCard title="Approved Requests" value={5} subtext="Successfully approved" icon={<Icon name="check-circle" size={24} />} />
        <MetricCard title="Security Status" value="Secure" subtext="Your account is protected" icon={<Icon name="shield-check" size={24} />} />
      </div>

      {/* 3. More dashboard sections will go here */}
        {/* 3. Quick Actions */}
        <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#281a3c', marginBottom: '16px' }}>
            Quick Actions
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div 
            onClick={() => navigate('/employee/access-requests/new')}
            style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eadde6' }}>
            <Icon name="key" size={24} />
            <h3 style={{ color: '#281a3c', margin: '12px 0 8px' }}>Request Access</h3>
            <p style={{ color: '#6b6470', fontSize: '14px' }}>Request permission to access applications and resources.</p>
            </div>

            <div 
            onClick={() => navigate('/employee/my-devices')}
            style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eadde6', cursor: 'pointer' }}>
            <Icon name="monitor" size={24} />
            <h3 style={{ color: '#281a3c', margin: '12px 0 8px' }}>My Devices</h3>
            <p style={{ color: '#6b6470', fontSize: '14px' }}>View your assigned devices and their security status.</p>
            </div>
        </div>
        </div>
        {/* 4. Recent Access Requests */}
        <div style={{ marginTop: '32px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#281a3c', marginBottom: '16px' }}>
            Recent Access Requests
        </h2>

        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eadde6', overflow: 'hidden' }}>
            {[
            { name: 'GitHub Repository', date: '02 Nov 2026', status: 'Approved' },
            { name: 'AWS Console', date: '01 Nov 2026', status: 'Pending' },
            { name: 'Jira Workspace', date: '30 Oct 2026', status: 'Rejected' },
            ].map((request, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: index !== 2 ? '1px solid #f0e8ed' : 'none', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                <h3 style={{ margin: 0, color: '#281a3c', fontSize: '15px' }}>{request.name}</h3>
                <p style={{ margin: '6px 0 0', color: '#8b7d89', fontSize: '13px' }}>{request.date}</p>
                </div>
                <span style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                background: request.status === 'Approved' ? '#e5f5eb' : request.status === 'Pending' ? '#fff4dc' : '#fde9e9',
                color: request.status === 'Approved' ? '#247a43' : request.status === 'Pending' ? '#a66b00' : '#c0392b',
                }}>
                {request.status}
                </span>
            </div>
            ))}
        </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button
           onClick={() => navigate('/employee/access-requests')}
           style={{
            background: '#281a3c',
            color: '#fff',
            border: 'none',
            padding: '11px 20px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 600,
            }}
        >
            View All Requests →
        </button>
        </div>
    </PageLayout>
  );
};

export default EmployeeDashboardPage;