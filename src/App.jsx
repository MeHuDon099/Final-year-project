import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberProfile from './pages/MemberProfile';
import Books from './pages/Books';
import Transactions from './pages/Transactions';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '0.75rem',
            background: '#1e293b',
            color: '#f8fafc',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2)',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#1e293b' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#1e293b' } },
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
          <Route path="members" element={<ProtectedRoute requiredRole="admin"><Members /></ProtectedRoute>} />
          <Route path="members/:id" element={<ProtectedRoute requiredRole="admin"><MemberProfile /></ProtectedRoute>} />
          <Route path="books" element={<ProtectedRoute requiredRole="admin"><Books /></ProtectedRoute>} />
          <Route path="transactions" element={<ProtectedRoute requiredRole="admin"><Transactions /></ProtectedRoute>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
