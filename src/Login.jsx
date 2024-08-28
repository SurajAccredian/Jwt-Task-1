import { useState, useEffect } from "react";
import axios from "axios";
import { isExpired, decodeToken } from "react-jwt";
import CryptoJS from "crypto-js";
import useAuth from "./hooks/useAuth";

function Login() {
  let { isAuthenticated, checkAuthStatus } = useAuth();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [userName, setUserName] = useState("");
  const [token, setToken] = useState("");

  const options = {
    headers: {
      "Content-Type": "application/json",
    },
  };

    function setCookie(name, value, hours) {
    try {
      let expires = "";
      if (hours) {
        const date = new Date();
        date.setTime(date.getTime() + hours * 60 * 60 * 1000);
        expires = `; expires=${date.toUTCString()}`;
      }
      document.cookie = `${name}=${encodeURIComponent(
        JSON.stringify(value)
      )}${expires}; path=/; domain=.vercel.app; SameSite=None; Secure`;

      console.log("The cookie created is " + document.cookie);
    } catch (e) {
      console.log("Error creating cokiee " + e);
    }
  }
  // domain=vercel.app

  function deleteCookie(name) {
    document.cookie = `${name}=; Max-Age=-99999999; path=/; domain=.vercel.app; SameSite=None; Secure`;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitForm = (e) => {
    e.preventDefault();
    const sendData = {
      email: user.email,
      password: CryptoJS.AES.encrypt(
        user.password,
        "ACCREDIAN@login$2022@$newweb$@"
      ).toString(),
    };

    console.log(sendData);

    axios
      .post(
        `https://accredian-backend-v1-image-7dra35jwyq-uc.a.run.app/login/prelogin`,
        JSON.stringify(sendData),
        options,
        {
          withCredentials: true,
        }
      )
      .then((result) => {
        if (result.data.status === 200) {
          console.log("The result is " + result.token);
          console.log("The result is " + result.name);

          const myDecodedToken = decodeToken(result.data.token);
          if (myDecodedToken) {
            setUserName(myDecodedToken.data.firstname);
            localStorage.setItem("name", myDecodedToken.data.firstname);
            localStorage.setItem("token", result.data.token);
            const userData = {
              name: myDecodedToken.data.firstname,
              token: result.data.token,
            };

            console.log(userData);
            setCookie("userData", userData, 12);
            setToken(result.data.token);
            console.log("calling now")
            checkAuthStatus();
          }
        } else if (result.data.status === 401) {
          console.error(
            "The password entered is incorrect. Please double-check your password or use the 'Lost Your Password' option to reset it."
          );
        } else if (result.data.status === 403) {
          console.error("Your access has been revoked.");
        } else if (result.data.status === 404) {
          console.error(
            "Please check the email or sign up to create a new account."
          );
        }
      })
      .catch((error) => {
        console.error("An error occurred during login:", error);
      });
  };

  const logout = () => {
    deleteCookie("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    checkAuthStatus();
    setUserName("");
    setToken("");
  };

  useEffect(() => {
    checkAuthStatus();
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const name = localStorage.getItem("name");
      if (token && !isExpired(token)) {
        setToken(token);
        setUserName(name || "");
        checkAuthStatus()
      } else {
        checkAuthStatus();
      }
    };

    checkAuth();

    // Event listener to update auth status when localStorage changes
    const handleStorageChange = (e) => {
      if (e.storageArea === localStorage) {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {userName}!</p>
          <a href={`https://jwt-task-2.vercel.app/token?token=${token}`}>
            View our new application
          </a>
          <br />
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <form onSubmit={submitForm}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={user.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={user.password}
            onChange={handleChange}
            required
          />

          <button type="submit">Login</button>
        </form>
      )}
    </div>
  );
}

export default Login;
