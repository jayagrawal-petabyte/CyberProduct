
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, StatusBadge, Button, Icon } from '../../../components/ui';
import EmployeeBottomNav from '../components/EmployeeBottomNav';
import './MyPoliciesPage.css';

type Policy = {
  id: number;
  title: string;
  category: string;
  description: string;
  updated: string;
  status: 'Acknowledged' | 'Pending';
};

const initialPolicies: Policy[] = [
  {
    id: 1,
    title: 'Information Security Policy',
    category: 'Security',
    description: 'Guidelines for protecting company information, systems, and digital assets.',
    updated: '01 Oct 2026',
    status: 'Pending',
  },
  {
    id: 2,
    title: 'Acceptable Use Policy',
    category: 'IT Usage',
    description: 'Rules for the appropriate use of company devices, networks, and resources.',
    updated: '15 Sep 2026',
    status: 'Acknowledged',
  },
  {
    id: 3,
    title: 'Password and Access Control Policy',
    category: 'Security',
    description: 'Requirements for password security, account access, and authentication.',
    updated: '20 Aug 2026',
    status: 'Pending',
  },
  {
    id: 4,
    title: 'Remote Work Policy',
    category: 'Workplace',
    description: 'Expectations and responsibilities when working remotely.',
    updated: '10 Aug 2026',
    status: 'Acknowledged',
  },
  {
    id: 5,
    title: 'Data Privacy Policy',
    category: 'Privacy',
    description: 'Guidelines for handling, storing, and sharing personal and sensitive data.',
    updated: '05 Jul 2026',
    status: 'Pending',
  },
];

const categories = ['All', 'Security', 'IT Usage', 'Workplace', 'Privacy'];

export default function MyPoliciesPage() {
  const [policies, setPolicies] = useState(initialPolicies);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      policy.title.toLowerCase().includes(search.toLowerCase()) ||
      policy.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === 'All' || policy.category === category;

    return matchesSearch && matchesCategory;
  });

  const acknowledgePolicy = (id: number) => {
    setPolicies((current) =>
      current.map((policy) =>
        policy.id === id
          ? { ...policy, status: 'Acknowledged' }
          : policy
      )
    );

    setSelectedPolicy((current) =>
      current?.id === id
        ? { ...current, status: 'Acknowledged' }
        : current
    );
  };

  const pendingCount = policies.filter(
    (policy) => policy.status === 'Pending'
  ).length;

  const acknowledgedCount = policies.length - pendingCount;

  const compliancePercentage =
    policies.length > 0
      ? Math.round((acknowledgedCount / policies.length) * 100)
      : 0;

  const nextPendingPolicy = policies.find(
    (policy) => policy.status === 'Pending'
  );

  return (
    <main className="employee-page">
      <div className="employee-page__content">
        <header className="employee-header">
          <img
            className="employee-header__logo"
            src="/assets/brainmint-logo.png"
            alt="BrainMint"
          />

          <Link
            className="employee-header__profile"
            to="/employee/profile"
            aria-label="My profile"
          >
            <Icon name="user" size={20} />
          </Link>
        </header>

        <div className="employee-policies">
          {/* Page Heading */}
          <div className="policies-header">
            <div>
              <p className="employee-welcome__eyebrow">
                EMPLOYEE PORTAL
              </p>
              <h1>My Policies</h1>
              <p>
                Review company policies and manage your acknowledgements.
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="policies-stats">
            <Card>
              <div className="policy-stat">
                <span className="policy-stat-icon total">
                  <Icon name="file-text" />
                </span>
                <div>
                  <h3>{policies.length}</h3>
                  <p>Total Policies</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="policy-stat">
                <span className="policy-stat-icon pending">
                  <Icon name="clock" />
                </span>
                <div>
                  <h3>{pendingCount}</h3>
                  <p>Pending Acknowledgement</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="policy-stat">
                <span className="policy-stat-icon acknowledged">
                  <Icon name="check-circle" />
                </span>
                <div>
                  <h3>{acknowledgedCount}</h3>
                  <p>Acknowledged</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Policy List + Right Sidebar */}
          <div className="policies-layout">

            {/* Main Policy List */}
            <Card>
              <div className="policies-toolbar">
                <div className="policies-search">
                  <Icon name="search" />
                  <input
                    type="text"
                    placeholder="Search policies..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  aria-label="Filter by category"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item === 'All' ? 'All Categories' : item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="policies-list">
                {filteredPolicies.length > 0 ? (
                  filteredPolicies.map((policy) => (
                    <div className="policy-item" key={policy.id}>
                      <div className="policy-document-icon">
                        <Icon name="file-text" />
                      </div>

                      <div className="policy-content">
                        <div className="policy-title-row">
                          <h3>{policy.title}</h3>
                          <StatusBadge
                            status={
                              policy.status === 'Pending'
                                ? 'pending'
                                : 'success'
                            }
                          />
                        </div>

                        <p>{policy.description}</p>

                        <div className="policy-meta">
                          <span>{policy.category}</span>
                          <span>Updated {policy.updated}</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPolicy(policy)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="policies-empty">
                    <Icon name="file-text" />
                    <h3>No policies found</h3>
                    <p>Try changing your search or category filter.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Right Sidebar */}
            <aside className="policies-sidebar">

              {/* Policy Compliance */}
              <Card>
                <div className="sidebar-card">
                  <h3>Policy Compliance</h3>

                  <div className="compliance-chart">
                    <div
                      className="compliance-circle"
                      style={{
                        background: `conic-gradient(#593267 ${compliancePercentage * 3.6}deg, #eee5f0 0deg)`,
                      }}
                    >
                      <div className="compliance-circle-inner">
                        <strong>{compliancePercentage}%</strong>
                        <span>compliant</span>
                      </div>
                    </div>
                  </div>

                  <p className="compliance-summary">
                    {acknowledgedCount} of {policies.length} policies acknowledged
                  </p>

                  <small>As of today</small>
                </div>
              </Card>

              {/* What's Next */}
              <Card>
                <div className="sidebar-card">
                  <div className="sidebar-heading">
                    <Icon name="alert-triangle" size={17} />
                    <h3>What's Next</h3>
                  </div>

                  {pendingCount > 0 ? (
                    <>
                      <strong className="sidebar-pending-count">
                        {pendingCount} policies require attention.
                      </strong>

                      <p>
                        Review your pending policies and complete the
                        required acknowledgements.
                      </p>

                      {nextPendingPolicy && (
                        <button
                          type="button"
                          className="sidebar-action"
                          onClick={() => setSelectedPolicy(nextPendingPolicy)}
                        >
                          Review {nextPendingPolicy.title}
                          <Icon name="arrow-right" size={14} />
                        </button>
                      )}
                    </>
                  ) : (
                    <p>
                      All policies have been acknowledged. You're up to date!
                    </p>
                  )}
                </div>
              </Card>

              {/* Need Help */}
              <Card>
                <div className="sidebar-card">
                  <h3>Need Help</h3>
                  <p>
                    Have a question about a policy? Your IT team can help.
                  </p>
                  <div className="sidebar-help-note">
                    Contact your IT support team for policy-related assistance.
                  </div>
                </div>
              </Card>

            </aside>
          </div>

          {/* Policy Details Modal */}
          {selectedPolicy && (
            <div
              className="policy-modal-overlay"
              onClick={() => setSelectedPolicy(null)}
            >
              <div
                className="policy-modal"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="policy-modal-header">
                  <div>
                    <span className="policy-modal-category">
                      {selectedPolicy.category}
                    </span>
                    <h2>{selectedPolicy.title}</h2>
                  </div>

                  <button
                    className="policy-close"
                    onClick={() => setSelectedPolicy(null)}
                    aria-label="Close policy details"
                  >
                    <Icon name="x" />
                  </button>
                </div>

                <div className="policy-modal-body">
                  <p>{selectedPolicy.description}</p>

                  <p>
                    <strong>Last Updated:</strong> {selectedPolicy.updated}
                  </p>

                  <div className="policy-detail-notice">
                    This is a demonstration policy summary. The complete
                    policy document will be available after document
                    integration.
                  </div>

                  <div className="policy-acknowledgement">
                    <strong>Acknowledgement Status</strong>
                    <StatusBadge
                      status={
                        selectedPolicy.status === 'Pending'
                          ? 'pending'
                          : 'success'
                      }
                    />
                  </div>
                </div>

                <div className="policy-modal-footer">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPolicy(null)}
                  >
                    Close
                  </Button>

                  {selectedPolicy.status === 'Pending' && (
                    <Button
                      onClick={() => acknowledgePolicy(selectedPolicy.id)}
                    >
                      <Icon name="check" />
                      Acknowledge Policy
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <EmployeeBottomNav />
    </main>
  );
}
