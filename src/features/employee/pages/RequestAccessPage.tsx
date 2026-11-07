import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui';
import EmployeeBottomNav from '../components/EmployeeBottomNav';
import { addAccessRequest } from '../services/accessRequestsStore';
import './RequestAccessPage.css';

const RequestAccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [resource, setResource] = useState('');
  const [accessLevel, setAccessLevel] = useState('Read-only');
  const [duration, setDuration] = useState('7 days');
  const [businessReason, setBusinessReason] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resource || !businessReason.trim()) return;

    addAccessRequest({
      resource,
      accessLevel,
      duration,
      businessReason,
      additionalDetails,
    });

    setSubmitted(true);
    navigate('/employee/access-requests', {
      state: {
        submittedSuccess: true,
      },
    });
  };

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

        <section className="employee-welcome">
          <div>
            <p className="employee-welcome__eyebrow">EMPLOYEE PORTAL</p>
            <h1>Request Access</h1>
            <p>Request permission to access the resources you need for your work.</p>
          </div>
          <Link
            className="employee-primary-button"
            to="/employee/access-requests"
          >
            <Icon name="file-text" size={16} />
            My Requests
          </Link>
        </section>

        {submitted ? (
          <section className="employee-panel request-success">
            <Icon name="check-circle" size={42} />
            <h2>Request submitted successfully</h2>
            <p>
              Your access request has been recorded in this demo interface.
              No approval workflow or backend submission is connected yet.
            </p>
            <Link to="/employee/access-requests">
              View My Requests →
            </Link>
            <button
              type="button"
              className="request-secondary-button"
              onClick={() => {
                setSubmitted(false);
                setResource('');
                setAccessLevel('Read-only');
                setDuration('7 days');
                setBusinessReason('');
                setAdditionalDetails('');
              }}
            >
              Submit another request
            </button>
          </section>
        ) : (
          <div className="request-layout">
            <form className="employee-panel request-form" onSubmit={handleSubmit}>
              <div className="request-form__heading">
                <h2>Access request details</h2>
                <p>Fields marked with * are required.</p>
              </div>

              <label htmlFor="resource">
                Resource or application <span>*</span>
              </label>
              <select
                id="resource"
                value={resource}
                onChange={(event) => setResource(event.target.value)}
                required
              >
                <option value="">Select a resource</option>
                <option value="GitHub Repository">GitHub Repository</option>
                <option value="AWS Console">AWS Console</option>
                <option value="Snowflake Analytics">Snowflake Analytics</option>
                <option value="Jira Workspace">Jira Workspace</option>
                <option value="Looker">Looker</option>
              </select>

              <label htmlFor="access-level">
                Required access level <span>*</span>
              </label>
              <select
                id="access-level"
                value={accessLevel}
                onChange={(event) => setAccessLevel(event.target.value)}
                required
              >
                <option>Read-only</option>
                <option>Contributor</option>
                <option>Editor</option>
                <option>Administrator</option>
              </select>

              <label htmlFor="duration">
                Access duration <span>*</span>
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                required
              >
                <option>7 days</option>
                <option>30 days</option>
                <option>90 days</option>
                <option>Permanent (requires justification)</option>
              </select>

              <label htmlFor="business-reason">
                Business justification <span>*</span>
              </label>
              <textarea
                id="business-reason"
                value={businessReason}
                onChange={(event) => setBusinessReason(event.target.value)}
                placeholder="Explain why you need this resource for your work..."
                rows={4}
                required
              />

              <label htmlFor="additional-details">
                Additional details <small>(Optional)</small>
              </label>
              <textarea
                id="additional-details"
                value={additionalDetails}
                onChange={(event) => setAdditionalDetails(event.target.value)}
                placeholder="Add any additional information..."
                rows={3}
              />

              <div className="request-form__actions">
                <Link to="/employee/access-requests" className="request-cancel-button">
                  Cancel
                </Link>
                <button type="submit" className="employee-primary-button">
                  <Icon name="arrow-right" size={16} />
                  Submit Request
                </button>
              </div>
            </form>

            <aside className="employee-panel request-guidance">
              <h2>Before you submit</h2>
              <div>
                <Icon name="shield-check" size={19} />
                <section>
                  <strong>Least privilege</strong>
                  <p>Request only the access level necessary for your task.</p>
                </section>
              </div>
              <div>
                <Icon name="clock" size={19} />
                <section>
                  <strong>Time-bound access</strong>
                  <p>Choose the shortest duration that meets your needs.</p>
                </section>
              </div>
              <div>
                <Icon name="file-text" size={19} />
                <section>
                  <strong>Clear justification</strong>
                  <p>Explain the work task that requires this resource.</p>
                </section>
              </div>
              <p className="request-guidance__note">
                Your request will require approval according to your
                organization's access policy.
              </p>
            </aside>
          </div>
        )}
      </div>

      <EmployeeBottomNav />
    </main>
  );
};

export default RequestAccessPage;