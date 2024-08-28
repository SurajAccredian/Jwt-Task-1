import { useState, useEffect } from "react";
import { isExpired } from "react-jwt";
import Cookies from 'js-cookie';


const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts >= 1) {
      return decodeURIComponent(parts.pop().split(";").shift());
    }
    return null;
  }

  const checkAuthStatus = () => {
    const token = getCookie('token');
    console.log("Called");
    console.log("Cookie:", token); // Debug: log the cookie value
    if (token) {
      try {
        const parsedtoken = JSON.parse(token);
        if (parsedtoken.token && !isExpired(parsedtoken)) {
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
