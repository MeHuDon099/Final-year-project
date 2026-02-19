import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberProfile from './pages/MemberProfile';
import Books from './pages/Books';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: 'var(--radius-md)',
            background: '#0f172a',
            color: '#fff',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route
            path="members"
            element={
              <ProtectedRoute requiredRole="admin">
                <Members />
              </ProtectedRoute>
            }
          />
          <Route
            path="members/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <MemberProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="books"
            element={
              <ProtectedRoute requiredRole="admin">
                <Books />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
