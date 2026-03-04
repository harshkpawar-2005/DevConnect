import { useAuth } from "@/context/AuthContext";
import HeaderLoggedIn from "./HeaderLoggedIn";
import HeaderLoggedOut from "./HeaderLoggedOut";

export default function Header() {
  const { user, loading } = useAuth();

  if (loading) return null; // don't flash wrong header while auth resolves

  return user ? <HeaderLoggedIn /> : <HeaderLoggedOut />;
}