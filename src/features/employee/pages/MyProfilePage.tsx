import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui';
import EmployeeBottomNav from '../components/EmployeeBottomNav';
import './MyProfilePage.css';

const MyProfilePage: React.FC = () => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('Maya Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [department, setDepartment] = useState('Engineering');
  const [jobTitle, setJobTitle] = useState('Software Engineer');

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
            <h1>My Profile</h1>
            <p>View and manage your personal employee information.</p>
          </div>

          <button
            type="button"
            className="employee-primary-button"
            onClick={() => setEditing((current) => !current)}
          >
            <Icon name="edit" size={16} />
            {editing ? 'Cancel editing' : 'Edit Profile'}
          </button>
        </section>

        <section className="employee-panel profile-identity">
          <div className="profile-avatar">MS</div>
          <div>
            <h2>{name}</h2>
            <p>{jobTitle}</p>
            <span className="employee-status employee-status--approved">
              Active Employee
            </span>
          </div>
        </section>

        <div className="profile-grid">
          <section className="employee-panel">
            <h2>Personal information</h2>

            <div className="profile-field">
              <label htmlFor="profile-name">Full name</label>
              <input
                id="profile-name"
                value={name}
                disabled={!editing}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-email">Work email</label>
              <input
                id="profile-email"
                value="maya.sharma@brainmint.com"
                disabled
                readOnly
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-phone">Phone number</label>
              <input
                id="profile-phone"
                value={phone}
                disabled={!editing}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-department">Department</label>
              <input
                id="profile-department"
                value={department}
                disabled={!editing}
                onChange={(event) => setDepartment(event.target.value)}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-job">Job title</label>
              <input
                id="profile-job"
                value={jobTitle}
                disabled={!editing}
                onChange={(event) => setJobTitle(event.target.value)}
              />
            </div>

            {editing && (
              <button
                type="button"
                className="employee-primary-button profile-save-button"
                onClick={() => setEditing(false)}
              >
                <Icon name="check" size={16} />
                Save changes
              </button>
            )}
          </section>

          <div className="profile-side-panels">
            <section className="employee-panel">
              <h2>Employment details</h2>

              <div className="profile-detail">
                <span>Employee ID</span>
                <strong>EMP-1024</strong>
              </div>
              <div className="profile-detail">
                <span>Department</span>
                <strong>{department}</strong>
              </div>
              <div className="profile-detail">
                <span>Employment type</span>
                <strong>Full-time</strong>
              </div>
              <div className="profile-detail">
                <span>Joining date</span>
                <strong>15 Jan 2024</strong>
              </div>
            </section>

            <section className="employee-panel">
              <h2>Account security</h2>

              <div className="profile-security-item">
                <Icon name="shield-check" size={19} />
                <div>
                  <strong>Account protected</strong>
                  <p>Your account security status is active.</p>
                </div>
              </div>

              <div className="profile-security-item">
                <Icon name="check-circle" size={19} />
                <div>
                  <strong>Multi-factor authentication</strong>
                  <p>Enabled for your account.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <EmployeeBottomNav />
    </main>
  );
};

export default MyProfilePage;