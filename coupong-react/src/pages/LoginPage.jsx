// Replaced by Clerk's built-in /sign-in flow — this page redirects there.
import { Navigate } from 'react-router-dom';
export default function LoginPage() {
    return <Navigate to="/sign-in" replace />;
}
