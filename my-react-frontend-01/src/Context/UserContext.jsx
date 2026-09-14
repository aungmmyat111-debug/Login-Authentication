// src/context/UserContext.jsx

import PropTypes from "prop-types";
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";

// Same-origin by default: /api/* is proxied in dev (vite.config.js) and
// rewritten on Vercel (vercel.json) so auth cookies stay first-party.
const API_URL = import.meta.env.VITE_API_URL || "";
// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const isInit = useRef(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState("");
  const [isLogInError, setIsLoginError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const me = useCallback(async () => {
    try {
      const result = await fetch(`${API_URL}/api/me`, {
        credentials: "include",
      });
      if (result.ok) {
        const data = await result.json();
        console.log("==>user data: ", data);
        setUser(data.user);
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error("Session check failed:", err);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const body = { email, password };
    console.log("==>Login body: ", body);

    try {
      const result = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (result.ok) {
        const data = await result.json();
        setUser(data.user);
        setIsLoggedIn(true);
        setIsLoginError(false);
        setLoginErrorMsg("");
        return true;
      }

      const errData = await result.json();
      console.log("==>Login failed: ", errData.message);
      setIsLoggedIn(false);
      setIsLoginError(true);
      setLoginErrorMsg(errData.message || "Invalid credentials");
      return false;
    } catch (err) {
      console.error("Login request failed:", err);
      setIsLoggedIn(false);
      setIsLoginError(true);
      setLoginErrorMsg("Network error occurred");
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    if (isInit.current) return;
    isInit.current = true;
    me();
  }, [me]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isLoggedIn,
      isLogInError,
      loginErrorMsg,
      isInitializing,
    }),
    [user, login, logout, isLoggedIn, isLogInError, loginErrorMsg, isInitializing]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};