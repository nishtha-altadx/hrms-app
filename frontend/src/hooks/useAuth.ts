import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile, loggedOut, login, signup } from "@/features/auth/authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector((state) => state.auth);

  return {
    user,
    status,
    error,
    signup: (data: Parameters<typeof signup>[0]) => dispatch(signup(data)),
    login: (data: Parameters<typeof login>[0]) => dispatch(login(data)),
    fetchProfile: () => dispatch(fetchProfile()),
    logout: () => dispatch(loggedOut()),
  };
}
