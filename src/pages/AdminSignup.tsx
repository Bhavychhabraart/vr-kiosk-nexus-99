
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminSignup from '@/components/auth/AdminSignup';

const AdminSignupPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/machine-admin', { replace: true });
    }
  }, [user, navigate]);

  const handleBack = () => {
    navigate('/auth');
  };

  return <AdminSignup onBack={handleBack} />;
};

export default AdminSignupPage;
