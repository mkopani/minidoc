import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { type RootState } from '@/store';

interface Props {
  element: JSX.Element;
}

const ProtectedRoute = (props: Props) => {
  const { element } = props;

  const user = useSelector((state: RootState) => state.user);

  // If user not authenticated, redirect to login page
  if (!user.token) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

export default ProtectedRoute;
