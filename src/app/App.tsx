import { RouterProvider } from 'react-router-dom'
import { router } from './router'

/**
 * Root application component.
 *
 * Responsibility: Mount global providers and the router.
 * Owner: Shivam Kumar (Frontend Lead)
 *
 * Add global providers (auth, theme, query client, etc.) here as the
 * project grows. Keep this file lean — delegate to providers/ for
 * individual provider implementations.
 */
export default function App() {
  return <RouterProvider router={router} />
}
