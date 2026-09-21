import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { cmsApi } from "../services/cmsApi";

const AuthContext = createContext(null);

// Fetches the logged-in user's identity + CMS role once per admin
// session, so any component can cheaply check `isSuperAdmin` to decide
// whether to show/enable a write control — matching what the backend
// will actually allow (StaffWritePublicReadPermission / SuperAdminOnlyPermission
// in cms/api/views.py) instead of only finding out after a 403.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    cmsApi
      .getMe()
      .then((data) => {
        setUser(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const isSuperAdmin = user?.role === "super_admin";

  return <AuthContext.Provider value={{ user, status, isSuperAdmin }}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
