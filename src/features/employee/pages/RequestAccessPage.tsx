import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui';
import EmployeeBottomNav from '../components/EmployeeBottomNav';
import { getResources, type BackendResource } from '../../../services/api/resourcesApi';
import { submitAccessRequest } from '../../../services/api/accessRequestsApi';
import { ApiError } from '../../../services/api/apiClient';
import './RequestAccessPage.css';

/** Convert "7 days" / "30 days" / "90 days" labels to minutes */
function durationToMinutes(label: string): number | undefined {
  if (label === '7 days') return 7 * 24 * 60;
  if (label === '30 days') return 30 * 24 * 60;
  if (label === '90 days') return 90 * 24 * 60;
  return undefined; // "Permanent"
}

const DURATION_OPTIONS = ['7 days', '30 days', '90 days', 'Permanent (requires justification)'];
const MAX_REASON_LENGTH = 1000;

const RequestAccessPage: React.FC = () => {
  const navigate = useNavigate();

  // Resources
  const [resources, setResources] = useState<BackendResource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState<string | null>(null);

  // Form state
  const [resourceId, setResourceId] = useState('');
  const [duration, setDuration] = useState('7 days');
  const [reason, setReason] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setResourcesLoading(true);
    setResourcesError(null);
    getResources()
      .then((data) => {
        setResources(data);
      })
      .catch((err) => {
        setResourcesError(
          err instanceof ApiError ? err.message : 'Could not load resources.',
        );
      })
      .finally(() => setResourcesLoading(false));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedReason = reason.trim();
    if (!resourceId || !trimmedReason) return;
    if (trimmedReason.length > MAX_REASON_LENGTH) {
      setSubmitError(`Reason must be at most ${MAX_REASON_LENGTH} characters.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitAccessRequest({
        resource_id: resourceId,
        reason: trimmedReason,
        requested_duration_minutes: durationToMinutes(duration),
      });

      navigate('/employee/access-requests', {
        state: { submittedSuccess: true },
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSubmitError('You already have a pending request for this resource.');
      } else {
        setSubmitError(err instanceof ApiError ? err.message : 'Failed to submit request. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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

        <div className="request-layout">
          <form className="employee-panel request-form" onSubmit={(e) => void handleSubmit(e)}>
            <div className="request-form__heading">
              <h2>Access request details</h2>
              <p>Fields marked with * are required.</p>
            </div>

            {submitError && (
              <div
                role="alert"
                style={{
                  color: 'var(--color-danger, #c0392b)',
                  background: 'var(--color-danger-bg, #fdf3f2)',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                {submitError}
              </div>
            )}

            <label htmlFor="resource">
              Resource or application <span>*</span>
            </label>
            {resourcesLoading ? (
              <select id="resource" disabled>
                <option>Loading resources…</option>
              </select>
            ) : resourcesError ? (
              <div style={{ color: 'var(--color-danger, #c0392b)', fontSize: '0.875rem' }}>
                {resourcesError}
              </div>
            ) : (
              <select
                id="resource"
                value={resourceId}
                onChange={(event) => setResourceId(event.target.value)}
                required
              >
                <option value="">Select a resource</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}{r.category ? ` (${r.category})` : ''}
                  </option>
                ))}
              </select>
            )}

            <label htmlFor="duration">
              Access duration <span>*</span>
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              required
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>

            <label htmlFor="business-reason">
              Business justification <span>*</span>
              <small style={{ float: 'right', fontWeight: 'normal' }}>
                {reason.length}/{MAX_REASON_LENGTH}
              </small>
            </label>
            <textarea
              id="business-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain why you need this resource for your work..."
              rows={4}
              maxLength={MAX_REASON_LENGTH}
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
              <button
                type="submit"
                className="employee-primary-button"
                disabled={isSubmitting || resourcesLoading}
              >
                <Icon name="arrow-right" size={16} />
                {isSubmitting ? 'Submitting…' : 'Submit Request'}
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
      </div>

      <EmployeeBottomNav />
    </main>
  );
};

export default RequestAccessPage;
