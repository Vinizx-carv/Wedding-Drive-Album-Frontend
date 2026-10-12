
import { Navigate, Route, Routes } from 'react-router-dom';

import AdminGate from './components/AdminGate';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEventDetails from './pages/AdminEventDetails';
import GuestEvent from './pages/GuestEvent';

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <AdminGate>
            <AdminDashboard />
          </AdminGate>
        }
      />

      <Route
        path="/admin/eventos/:eventId"
        element={
          <AdminGate>
            <AdminEventDetails />
          </AdminGate>
        }
      />

      <Route path="/evento/:token" element={<GuestEvent />} />

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
