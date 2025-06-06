
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  venueId?: string;
  fallbackPath?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requiredRoles,
  venueId,
  fallbackPath = '/auth' 
}: ProtectedRouteProps) => {
  const { user, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Card className="w-full max-w-md bg-black/80 border-vr-primary/30">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vr-primary mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole, venueId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Card className="w-full max-w-md bg-black/80 border-red-500/30">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-gray-300 mb-4">
              You don't have the required permissions to access this page.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Lock className="h-4 w-4" />
              <span>Required role: {requiredRole}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiredRoles && !requiredRoles.some(role => hasRole(role, venueId))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Card className="w-full max-w-md bg-black/80 border-red-500/30">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-gray-300 mb-4">
              You don't have the required permissions to access this page.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Lock className="h-4 w-4" />
              <span>Required roles: {requiredRoles.join(', ')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
