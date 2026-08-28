import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth, RequireRole } from '@/components/auth/RouteGuards';

import Login from './pages/Login';
import Setup from './pages/Setup';
import AdminDashboard from './pages/admin/AdminDashboard';
import Tenants from './pages/admin/Tenants';
import Users from './pages/admin/Users';
import Health from './pages/admin/Health';
import Leaderboard from './pages/admin/Leaderboard';
import Categories from './pages/tenant/Categories';
import Suppliers from './pages/tenant/Suppliers';
import TenantUsers from './pages/tenant/TenantUsers';
import Products from './pages/tenant/Products';
import Transactions from './pages/tenant/Transactions';
import { useAuth } from './context/AuthContext';

import Dashboard from './pages/tenant/Dashboard';
import LowStock from './pages/tenant/reports/LowStock';
import SalesSummary from './pages/tenant/reports/SalesSummary';
import UsageMetrics from './pages/tenant/reports/UsageMetrics';
import Reconciliation from './pages/tenant/reports/Reconciliation';
import TenantLeaderboard from './pages/tenant/TenantLeaderboard';

// Temporary placeholders for routes we haven't built yet
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex h-full items-center justify-center p-12">
    <h1 className="text-2xl font-bold text-muted-foreground">{title}</h1>
  </div>
);

// Dynamic redirect component
const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'SUPER_ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<Setup />} />

          {/* Protected Routes Wrapper */}
          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              
              {/* Common Default Route based on role */}
              <Route path="/" element={<RootRedirect />} />
              
              {/* Tenant Admin & User Routes */}
              <Route element={<RequireRole roles={['TENANT_ADMIN', 'TENANT_USER']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/inventory/transactions" element={<Transactions />} />
                <Route path="/reports/low-stock" element={<LowStock />} />
                <Route path="/reports/sales-summary" element={<SalesSummary />} />
              </Route>

              {/* Tenant Admin Exclusive Routes */}
              <Route element={<RequireRole roles={['TENANT_ADMIN']} />}>
                <Route path="/users" element={<TenantUsers />} />
                <Route path="/reports/usage" element={<UsageMetrics />} />
                <Route path="/reports/reconciliation" element={<Reconciliation />} />
                <Route path="/leaderboard" element={<TenantLeaderboard />} />
              </Route>

              {/* Super Admin Routes */}
              <Route element={<RequireRole roles={['SUPER_ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/tenants" element={<Tenants />} />
                <Route path="/admin/users" element={<Users />} />
                <Route path="/admin/leaderboard" element={<Leaderboard />} />
                <Route path="/admin/health" element={<Health />} />
              </Route>
              
              {/* 403 / 404 */}
              <Route path="/403" element={<Placeholder title="403 - Access Denied" />} />
              <Route path="*" element={<Placeholder title="404 - Not Found" />} />
            </Route>
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}
