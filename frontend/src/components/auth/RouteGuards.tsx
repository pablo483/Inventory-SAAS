import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type Role } from '@/context/AuthContext';

export const RequireAuth = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export const RequireRole = ({ roles }: { roles: Role[] }) => {
  const { user } = useAuth();
  
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }
  
  return <Outlet />;
};
