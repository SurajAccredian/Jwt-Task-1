import { useState, useEffect } from "react";
import { isExpired } from "react-jwt";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(";").shift());
    }
    return null;
  }

  const checkAuthStatus = () => {
    const userData = getCookie('userData');
    console.log("Called");
    console.log("Cookie:", userData); // Debug: log the cookie value
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        if (parsedUserData.token && !isExpired(parsedUserData.token)) {
          console.log("Authentication status: authenticated");
          setIsAuthenticated(true);
        } else {
          console.log("Authentication status: not authenticated");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error parsing cookie:", error);
        setIsAuthenticated(false);
      }
    } else {
      console.log("No userData cookie found");
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    setLoading(false);
  }, []);

  return { isAuthenticated, loading, checkAuthStatus };
};

export default useAuth;
