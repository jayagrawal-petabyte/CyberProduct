/**
 * BrainMint — Create / Edit Security Policy Form Modal
 * Scope: src/features/security-management/components/PolicyFormModal.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * LOCAL DEVELOPMENT PROTOTYPE: submitting this form only creates or patches
 * a temporary in-memory mock record. Nothing is persisted to a backend and
 * nothing on this screen is enforced. The in-modal note states this clearly.
 *
 * Built on the shared BrainMint `Modal` with a real <form>, labelled
 * inputs, required-field validation, and Cancel/Escape/close support.
 */

import React, { useEffect, useState } from 'react'
import {
  EnforcementMode,
  PolicyFormValues,
  PolicyState,
  POLICY_STATE_LABELS,
  SecurityPolicyRecord,
} from '../types/policy.types'
import { Modal, Icon } from '../../../components/ui'
import { POLICY_ENFORCEMENT_OPTIONS } from '../data/mockSecurityPolicies'

interface PolicyFormModalProps {
  isOpen: boolean
  onClose: () => void
  /** Receives the validated values; the hook applies them in memory. */
  onSubmit: (values: PolicyFormValues) => void
  /** 'create' (new local draft) or 'edit' (patch an existing record). */
  mode: 'create' | 'edit'
  /** Record to prefill when editing. */
  initial?: SecurityPolicyRecord | null
  categories: string[]
}

interface FormState {
  name: string
  version: string
  categoryValue: string
  stateValue: string
  enforcementValue: string
  description: string
  scope: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const DEFAULT_SCOPE = 'All workspaces'

const FIELD_LABELS: Record<keyof FormState, string> = {
  name: 'Policy name',
  version: 'Version',
  categoryValue: 'Category',
  stateValue: 'State',
  enforcementValue: 'Enforcement mode',
  description: 'Description',
  scope: 'Scope',
}

/** True when the field is missing (empty selects count as "not chosen"). */
function fieldInvalid(key: keyof FormState, value: string): boolean {
  if (key === 'version' || key === 'scope') return false // optional fields
  return value.trim() === ''
}

const STATE_OPTIONS: PolicyState[] = ['published', 'under-review', 'draft', 'retired']

export const PolicyFormModal: React.FC<PolicyFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initial,
  categories,
}) => {
  const [form, setForm] = useState<FormState>({
    name: '',
    version: '',
    categoryValue: '',
    stateValue: '',
    enforcementValue: '',
    description: '',
    scope: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  // Reset + prefill each time the modal is (re)opened.
  useEffect(() => {
    if (!isOpen) return
    if (mode === 'edit' && initial) {
      setForm({
        name: initial.name,
        version: initial.version,
        categoryValue: initial.category,
        stateValue: initial.state,
        enforcementValue: initial.enforcement,
        description: initial.description,
        scope: initial.scope,
      })
    } else {
      setForm({
        name: '',
        version: '',
        categoryValue: '',
        stateValue: '',
        enforcementValue: '',
        description: '',
        scope: DEFAULT_SCOPE,
      })
    }
    setErrors({})
    setSubmitAttempted(false)
    window.setTimeout(
      () => document.getElementById('secpol-form-name')?.focus(),
      50,
    )
  }, [isOpen, mode, initial])

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    // Live-revalidate fields the user has already been warned about.
    setErrors((prev) => {
      if (!submitAttempted && !prev[key]) return prev
      const next = { ...prev }
      if (fieldInvalid(key, value)) next[key] = `${FIELD_LABELS[key]} is required.`
      else delete next[key]
      return next
    })
  }

  const validate = (): FormErrors => {
    const next: FormErrors = {}
    ;(Object.keys(FIELD_LABELS) as Array<keyof FormState>).forEach((key) => {
      if (fieldInvalid(key, form[key])) next[key] = `${FIELD_LABELS[key]} is required.`
    })
    return next
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitAttempted(true)
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      version: form.version.trim(),
      category: form.categoryValue as PolicyFormValues['category'],
      state: form.stateValue as PolicyState,
      enforcement: form.enforcementValue as EnforcementMode,
      scope: form.scope.trim() || DEFAULT_SCOPE,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit policy' : 'Create policy'}
      description="Local development prototype — records are in-memory mock drafts only."
      maxWidth="md"
    >
      <form
        className="secpol-form"
        onSubmit={handleSubmit}
        noValidate
        aria-label={mode === 'edit' ? 'Edit policy form' : 'Create policy form'}
      >
        {/* Name + Version row */}
        <div className="secpol-form-grid">
          <div className="secpol-form-field">
            <label htmlFor="secpol-form-name">
              Policy name <span aria-hidden="true">*</span>
            </label>
            <input
              id="secpol-form-name"
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              aria-required="true"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'secpol-form-name-error' : undefined}
              placeholder="e.g. Acceptable Use"
            />
            {errors.name && (
              <p id="secpol-form-name-error" className="secpol-form-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="secpol-form-field">
            <label htmlFor="secpol-form-version">Version</label>
            <input
              id="secpol-form-version"
              type="text"
              value={form.version}
              onChange={(e) => setField('version', e.target.value)}
              placeholder="v0.1 (default)"
            />
          </div>
        </div>

        {/* Category + State row */}
        <div className="secpol-form-grid">
          <div className="secpol-form-field">
            <label htmlFor="secpol-form-category">
              Category <span aria-hidden="true">*</span>
            </label>
            <div className="secpol-select-wrap secpol-select-wrap--form">
              <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
              <select
                id="secpol-form-category"
                value={form.categoryValue}
                onChange={(e) => setField('categoryValue', e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.categoryValue)}
                aria-describedby={errors.categoryValue ? 'secpol-form-category-error' : undefined}
              >
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {errors.categoryValue && (
              <p id="secpol-form-category-error" className="secpol-form-error" role="alert">
                {errors.categoryValue}
              </p>
            )}
          </div>

          <div className="secpol-form-field">
            <label htmlFor="secpol-form-state">
              State <span aria-hidden="true">*</span>
            </label>
            <div className="secpol-select-wrap secpol-select-wrap--form">
              <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
              <select
                id="secpol-form-state"
                value={form.stateValue}
                onChange={(e) => setField('stateValue', e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.stateValue)}
                aria-describedby={errors.stateValue ? 'secpol-form-state-error' : undefined}
              >
                <option value="">Select a state…</option>
                {STATE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{POLICY_STATE_LABELS[s]}</option>
                ))}
              </select>
            </div>
            {errors.stateValue && (
              <p id="secpol-form-state-error" className="secpol-form-error" role="alert">
                {errors.stateValue}
              </p>
            )}
          </div>
        </div>

        {/* Enforcement + Scope row */}
        <div className="secpol-form-grid">
          <div className="secpol-form-field">
            <label htmlFor="secpol-form-enforcement">
              Enforcement mode <span aria-hidden="true">*</span>
            </label>
            <div className="secpol-select-wrap secpol-select-wrap--form">
              <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
              <select
                id="secpol-form-enforcement"
                value={form.enforcementValue}
                onChange={(e) => setField('enforcementValue', e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.enforcementValue)}
                aria-describedby={errors.enforcementValue ? 'secpol-form-enforcement-error' : undefined}
              >
                <option value="">Select enforcement…</option>
                {POLICY_ENFORCEMENT_OPTIONS.map((mode) => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
            {errors.enforcementValue && (
              <p id="secpol-form-enforcement-error" className="secpol-form-error" role="alert">
                {errors.enforcementValue}
              </p>
            )}
          </div>

          <div className="secpol-form-field">
            <label htmlFor="secpol-form-scope">Scope</label>
            <input
              id="secpol-form-scope"
              type="text"
              value={form.scope}
              onChange={(e) => setField('scope', e.target.value)}
              placeholder="All workspaces (default)"
            />
          </div>
        </div>

        {/* Description */}
        <div className="secpol-form-field">
          <label htmlFor="secpol-form-description">
            Description <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="secpol-form-description"
            rows={3}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'secpol-form-description-error' : undefined}
            placeholder="What does this policy govern?"
          />
          {errors.description && (
            <p id="secpol-form-description-error" className="secpol-form-error" role="alert">
              {errors.description}
            </p>
          )}
        </div>

        {/* Honesty note */}
        <div className="secpol-form-note" role="note">
          <Icon name="alert-triangle" size={13} />
          <span>
            Local development prototype — this record lives only in memory and is
            <strong> not saved to a backend</strong> and <strong>not enforced</strong>.
          </span>
        </div>

        {/* Actions */}
        <div className="secpol-form-actions">
          <button type="button" className="secpol-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="secpol-btn-primary">
            {mode === 'edit' ? 'Save changes' : 'Create local draft'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default PolicyFormModal
