/**
 * BrainMint — Add / Edit Restricted Resource Form Modal
 * Scope: src/features/security-management/components/RestrictedResourceFormModal.tsx
 * Owner: Ishaan Gupta (Security Management module)
 *
 * LOCAL DEVELOPMENT PROTOTYPE: submitting this form only appends or patches
 * a temporary in-memory mock record. Nothing is persisted to a backend and
 * nothing on this screen blocks, grants, or enforces resource access. The
 * in-modal note states this clearly.
 *
 * Built on the shared BrainMint `Modal` with a real <form>, labelled
 * inputs, required-field validation, and Cancel/Escape/close support.
 * Reuses the security-management form chassis classes (.secpol-*).
 */

import React, { useEffect, useMemo, useState } from 'react'
import type {
  AdminResourceRecord,
  ResourceAccessLevel,
  ResourceCategory,
  ResourceStatus,
  ResourceType,
} from '../types/restrictedResource.types'
import { RESOURCE_ACCESS_LABELS, RESOURCE_STATUS_LABELS } from '../types/restrictedResource.types'
import type { RestrictedResourceFormValues } from '../types/restrictedResource.types'
import { Modal, Icon } from '../../../components/ui'

interface RestrictedResourceFormModalProps {
  isOpen: boolean
  onClose: () => void
  /** Receives the validated values; the hook applies them in memory. */
  onSubmit: (values: RestrictedResourceFormValues) => void
  /** 'create' (new local record) or 'edit' (patch an existing record). */
  mode: 'create' | 'edit'
  /** Record to prefill when editing. */
  initial?: AdminResourceRecord | null
  categories: string[]
  typesByCategory: Record<ResourceCategory, ResourceType[]>
  accessLevels: string[]
  statuses: string[]
  departments: string[]
}

interface FormState {
  name: string
  categoryValue: string
  typeValue: string
  identifier: string
  accessValue: string
  statusValue: string
  departmentValue: string
  description: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const FIELD_LABELS: Record<keyof FormState, string> = {
  name: 'Resource name',
  categoryValue: 'Category',
  typeValue: 'Resource type',
  identifier: 'Identifier',
  accessValue: 'Access classification',
  statusValue: 'Status',
  departmentValue: 'Owner department',
  description: 'Description',
}

/** True when the field is missing (empty selects count as "not chosen"). */
function fieldInvalid(key: keyof FormState, value: string): boolean {
  return value.trim() === ''
}

export const RestrictedResourceFormModal: React.FC<RestrictedResourceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initial,
  categories,
  typesByCategory,
  accessLevels,
  statuses,
  departments,
}) => {
  const [form, setForm] = useState<FormState>({
    name: '',
    categoryValue: '',
    typeValue: '',
    identifier: '',
    accessValue: '',
    statusValue: '',
    departmentValue: '',
    description: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  // Reset + prefill each time the modal is (re)opened.
  useEffect(() => {
    if (!isOpen) return
    if (mode === 'edit' && initial) {
      setForm({
        name: initial.name,
        categoryValue: initial.category,
        typeValue: initial.type,
        identifier: initial.identifier,
        accessValue: initial.access,
        statusValue: initial.status,
        departmentValue: initial.ownerDepartment,
        description: initial.description,
      })
    } else {
      setForm({
        name: '',
        categoryValue: '',
        typeValue: '',
        identifier: '',
        accessValue: '',
        statusValue: '',
        departmentValue: '',
        description: '',
      })
    }
    setErrors({})
    setSubmitAttempted(false)
    window.setTimeout(
      () => document.getElementById('secres-form-name')?.focus(),
      50,
    )
  }, [isOpen, mode, initial])

  // Valid resource types for the chosen category (derived from the dataset).
  const typeOptions = useMemo(
    () => (form.categoryValue ? typesByCategory[form.categoryValue as ResourceCategory] ?? [] : []),
    [form.categoryValue, typesByCategory],
  )

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      // Changing the category may invalidate the chosen type.
      if (key === 'categoryValue') {
        const allowed =
          value === '' ? [] : typesByCategory[value as ResourceCategory] ?? []
        if (prev.typeValue && !allowed.includes(prev.typeValue as ResourceType)) {
          next.typeValue = ''
        }
      }
      return next
    })
    // Live-revalidate fields the user has already been warned about.
    setErrors((prev) => {
      if (!submitAttempted && !prev[key]) return prev
      const next2 = { ...prev }
      if (fieldInvalid(key, value)) next2[key] = `${FIELD_LABELS[key]} is required.`
      else delete next2[key]
      return next2
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
      category: form.categoryValue as ResourceCategory,
      type: form.typeValue as ResourceType,
      identifier: form.identifier.trim(),
      access: form.accessValue as ResourceAccessLevel,
      status: form.statusValue as ResourceStatus,
      ownerDepartment: form.departmentValue.trim(),
      description: form.description.trim(),
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit resource' : 'Add resource'}
      description="Local development prototype — records are in-memory mock entries only."
      maxWidth="md"
    >
      <form
        className="secpol-form"
        onSubmit={handleSubmit}
        noValidate
        aria-label={mode === 'edit' ? 'Edit resource form' : 'Add resource form'}
      >
        {/* Name row */}
        <div className="secpol-form-field">
          <label htmlFor="secres-form-name">
            Resource name <span aria-hidden="true">*</span>
          </label>
          <input
            id="secres-form-name"
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'secres-form-name-error' : undefined}
            placeholder="e.g. Production Kubernetes Cluster"
          />
          {errors.name && (
            <p id="secres-form-name-error" className="secpol-form-error" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Category + Type row */}
        <div className="secpol-form-grid">
          <div className="secpol-form-field">
            <label htmlFor="secres-form-category">
              Category <span aria-hidden="true">*</span>
            </label>
            <div className="secpol-select-wrap secpol-select-wrap--form">
              <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
              <select
                id="secres-form-category"
                value={form.categoryValue}
                onChange={(e) => setField('categoryValue', e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.categoryValue)}
                aria-describedby={errors.categoryValue ? 'secres-form-category-error' : undefined}
              >
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {errors.categoryValue && (
              <p id="secres-form-category-error" className="secpol-form-error" role="alert">
                {errors.categoryValue}
              </p>
            )}
          </div>

          <div className="secpol-form-field">
            <label htmlFor="secres-form-type">
              Resource type <span aria-hidden="true">*</span>
            </label>
            <div className="secpol-select-wrap secpol-select-wrap--form">
              <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
              <select
                id="secres-form-type"
                value={form.typeValue}
                onChange={(e) => setField('typeValue', e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.typeValue)}
                aria-describedby={errors.typeValue ? 'secres-form-type-error' : undefined}
                disabled={!form.categoryValue}
              >
                <option value="">
                  {form.categoryValue && typeOptions.length === 0
                    ? 'No matching types'
                    : 'Select a type…'}
                </option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            {errors.typeValue && (
              <p id="secres-form-type-error" className="secpol-form-error" role="alert">
                {errors.typeValue}
              </p>
            )}
          </div>
        </div>

        {/* Identifier row */}
        <div className="secpol-form-field">
          <label htmlFor="secres-form-identifier">
            Identifier <span aria-hidden="true">*</span>
          </label>
          <input
            id="secres-form-identifier"
            type="text"
            value={form.identifier}
            onChange={(e) => setField('identifier', e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby={errors.identifier ? 'secres-form-identifier-error' : undefined}
            placeholder="URL for websites/apps, or e.g. k8s://bm-prod-east-01"
          />
          {errors.identifier && (
            <p id="secres-form-identifier-error" className="secpol-form-error" role="alert">
              {errors.identifier}
            </p>
          )}
        </div>

        {/* Access + Status row */}
        <div className="secpol-form-grid">
          <div className="secpol-form-field">
            <label htmlFor="secres-form-access">
              Access classification <span aria-hidden="true">*</span>
            </label>
            <div className="secpol-select-wrap secpol-select-wrap--form">
              <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
              <select
                id="secres-form-access"
                value={form.accessValue}
                onChange={(e) => setField('accessValue', e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.accessValue)}
                aria-describedby={errors.accessValue ? 'secres-form-access-error' : undefined}
              >
                <option value="">Select classification…</option>
                {accessLevels.map((level) => (
                  <option key={level} value={level}>
                    {RESOURCE_ACCESS_LABELS[level as keyof typeof RESOURCE_ACCESS_LABELS] ?? level}
                  </option>
                ))}
              </select>
            </div>
            {errors.accessValue && (
              <p id="secres-form-access-error" className="secpol-form-error" role="alert">
                {errors.accessValue}
              </p>
            )}
          </div>

          <div className="secpol-form-field">
            <label htmlFor="secres-form-status">
              Status <span aria-hidden="true">*</span>
            </label>
            <div className="secpol-select-wrap secpol-select-wrap--form">
              <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
              <select
                id="secres-form-status"
                value={form.statusValue}
                onChange={(e) => setField('statusValue', e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.statusValue)}
                aria-describedby={errors.statusValue ? 'secres-form-status-error' : undefined}
              >
                <option value="">Select status…</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {RESOURCE_STATUS_LABELS[s as keyof typeof RESOURCE_STATUS_LABELS] ?? s}
                  </option>
                ))}
              </select>
            </div>
            {errors.statusValue && (
              <p id="secres-form-status-error" className="secpol-form-error" role="alert">
                {errors.statusValue}
              </p>
            )}
          </div>
        </div>

        {/* Owner department + Description */}
        <div className="secpol-form-grid">
          <div className="secpol-form-field">
            <label htmlFor="secres-form-department">
              Owner department <span aria-hidden="true">*</span>
            </label>
            <div className="secpol-select-wrap secpol-select-wrap--form">
              <Icon name="chevron-down" size={13} className="secpol-select-chevron" />
              <select
                id="secres-form-department"
                value={form.departmentValue}
                onChange={(e) => setField('departmentValue', e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.departmentValue)}
                aria-describedby={errors.departmentValue ? 'secres-form-department-error' : undefined}
              >
                <option value="">Select department…</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            {errors.departmentValue && (
              <p id="secres-form-department-error" className="secpol-form-error" role="alert">
                {errors.departmentValue}
              </p>
            )}
          </div>

          <div className="secpol-form-field">
            <label htmlFor="secres-form-description">
              Description <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="secres-form-description"
              rows={2}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              aria-required="true"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'secres-form-description-error' : undefined}
              placeholder="What is this resource and who uses it?"
            />
            {errors.description && (
              <p id="secres-form-description-error" className="secpol-form-error" role="alert">
                {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Honesty note */}
        <div className="secpol-form-note" role="note">
          <Icon name="alert-triangle" size={13} />
          <span>
            Local development prototype — this record lives only in memory and is
            <strong> not saved to a backend</strong>. This screen does
            <strong> not block or grant access</strong> to any resource.
          </span>
        </div>

        {/* Actions */}
        <div className="secpol-form-actions">
          <button type="button" className="secpol-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="secpol-btn-primary">
            {mode === 'edit' ? 'Save changes' : 'Add local record'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default RestrictedResourceFormModal
