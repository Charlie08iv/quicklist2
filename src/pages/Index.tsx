
import { Navigate } from "react-router-dom";

// Redirect to Lists page
const Index = () => {
  return <Navigate to="/lists" replace />;
};

export default Index;
