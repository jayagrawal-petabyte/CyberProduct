import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider, NotificationProvider } from './providers';

/**
 * Root application component.
 *
 * Responsibility: Mount global providers and the router.
 * Owner: Shivam Kumar (Frontend Lead)
 */
export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </AuthProvider>
  );
}
