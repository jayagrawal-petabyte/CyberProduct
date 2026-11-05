import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from './providers'; // or use relative path '../features/security/SecurityView'

/**
 * Root application component.
 *
 * Responsibility: Mount global providers and the router.
 * Owner: Shivam Kumar (Frontend Lead)
 */
export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
