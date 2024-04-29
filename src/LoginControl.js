// LoginControl.js
import React, { useState, useEffect } from 'react';
import Cookies from "js-cookie"
import "./login-control.css";

const LoginControl = ({ initialState, handleAuthChange }) => {
  const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
  const [ authenticated, setAuthenticated] = useState(initialState);
  const [ authenticating, setAuthenticating] = useState(false);
  const [ failedAuth, setFailedAuth] = useState(false);
  const [ userName, setUsername] = useState("");
  const [ password, setPassword] = useState("");

  useEffect(() => {
    var authHeader = Cookies.get("authHeader")
    if (authHeader) {
      setAuthenticated(true)
      handleAuthChange(true, authHeader)
    } else {
      setAuthenticated(false)
    }
  }, [handleAuthChange])

  const onLoginAttempt = async () => {
    if (userName.length > 0 && password.length > 0) {
      var md5 = require('md5');
      var header = md5(password)
      header = (userName + ":") + header
      header = btoa(header)
      header = "Basic " + header

      var loginUrl = process.env.REACT_APP_API_HOST + '/api/login'
      const headers = { 'Authorization': header };
 
      const response = await fetch(loginUrl,
        {
          headers
        }
      );

      if (response.status === 200) {
        setAuthenticated(!authenticated)
        Cookies.set('authHeader', header)
        Cookies.set('displayUser', userName)
        handleAuthChange(!authenticated, header)
        setFailedAuth(false)
        setAuthenticating(false)
      } else {
        setFailedAuth(true)
      }
    }
  };
  
  const onLogout = async() => {
    Cookies.remove('authHeader')
    Cookies.remove('displayUser')
    setAuthenticated(false)
    handleAuthChange(false, "")
    setFailedAuth(false)
    setAuthenticating(false)
  }

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      onLoginAttempt();
    } else if (e.key === 'Escape') {
      setAuthenticating(false)
    }
  }

  const onUserNameChange = (event) => {
    setUsername(event.target.value);
  };

  const onPasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const startAuthenticating = async () => {
    setAuthenticating(true);
    await sleepNow(500)
    const element = await document.getElementById("username-input")
    element.focus();
  }

  return (
    <div>
      {
        authenticating ? (
          <span><label>Username: <input id="username-input" value={userName} type="text" onChange={onUserNameChange} onKeyDown={handleKeyPress} /></label><br />
          <label>Password: <input id="password-input" value={password} type="password" onChange={onPasswordChange} onKeyDown={handleKeyPress} /></label><br />
          <input className="log-button" type="button" value="Login" onClick={onLoginAttempt} /><br /><label hidden={!failedAuth}>Authentication failed</label></span>
        ) : authenticated ? (
          <span><i>Logged in as <b>{ Cookies.get("displayUser") }</b></i><br />
          <input className="log-button" type="button" value="Logout" onClick={onLogout} />
          </span>
        ) : (
          <span><i>Read-only, not logged in.</i><br />
          <input className="log-button" type="button" value="Login" onClick={startAuthenticating} />
          </span>
        )
    }
    </div>
  );
};

export default LoginControl;
