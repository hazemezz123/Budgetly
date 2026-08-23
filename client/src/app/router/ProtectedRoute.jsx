import { Navigate } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";

export default function ProtectedRoute({ children, requireHouse = true }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireHouse && !user.house) {
    return <Navigate to="/house-selection" />;
  }

  return children;
}
