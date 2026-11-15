/**
 * PlaceholderPage
 *
 * Temporary page component used to hold a route slot until the real feature
 * page is implemented by the feature owner.
 *
 * Owner: Shivam Kumar (Frontend Lead)
 * Remove this file once all placeholder routes are replaced with real pages.
 */
export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>{title}</h1>
      <p style={{ color: '#6b7280' }}>
        This page is a placeholder. The feature owner will implement it in the
        next phase.
      </p>
    </div>
  )
}
