import React, { useState, useEffect, useRef } from "react";
import "../css/Login.css";
import ForgotPassword from "../components/ForgotPassword";
import { Typography, Button, Link, CircularProgress } from "@material-ui/core";
import { useDispatch } from "react-redux";

import { auth } from "../firebase";
import { loginUser } from "../actions/authActions";
import useAuth from "../hooks/useAuth";

function Login() {
  const { signUp, signIn, updateProfile, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true); // to keep track of whether the user is trying to login or Signup
  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState(null);
  const formRef = useRef();
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false); // To handle ForgotPassword Component

  // Setting Up a Listener, that will keep listening for AuthChange events
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      // If the authChange gives the logged in user,
      if (authUser) {
        const user = {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          photoURL: authUser.photoURL,
        };
        dispatch(loginUser(user)); // then dispatch the LOGIN_USER
      } else {
        setIsLoading(false);
      }
    });

    const timeOut = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timeOut); // clears the setTimeout
      unsubscribe(); // unsubscribe from listening to Auth Changes when the componenet Closes
    };
  }, [dispatch]);

  // EveryTime User switches between Login and Sign Up reset all the InputFields
  useEffect(() => {
    if (isLoading) return;
    formRef.current.email.value = "";
    formRef.current.password.value = "";
    setErr(null); // reset the error State
  }, [isLogin, isLoading]);

  // Everytime an Error Occur Reset the passwordField
  useEffect(() => {
    if (err) formRef.current.password.value = "";
  }, [err]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const data = {
      email: formRef.current.email.value,
      password: formRef.current.password.value,
    };

    try {
      if (isLogin) {
        // If the User is trying to Log In
        await signIn(data.email, data.password);
      } else {
        // If the User is trying to Sign UP
        data.name = formRef.current.name.value;
        data.photoURL = formRef.current.photoURL.value;
        const userAuth = await signUp(data.email, data.password);
        console.log(userAuth.user);
        await updateProfile(userAuth, data.name, data.photoURL);
      }
    } catch (error) {
      setErr(error);
    }
  };

  return (
    <div className="login user-select-none">
      <Typography variant="h1" color="secondary" align="center">
        Octave{" "}
      </Typography>
      {isLoading ? (
        <CircularProgress color="secondary" />
      ) : (
        <div className="login__wrapper user-select-none">
          <Typography align="center" variant="h5">
            {isLogin ? "SIGN IN" : "SIGN UP"}
          </Typography>

          <form
            className="login__form"
            onSubmit={handleFormSubmit}
            autoComplete="off"
            ref={formRef}
          >
            {!isLogin && (
              <div className="login__formGroup">
                <input
                  type="text"
                  name="name"
                  className="login__formInput"
                  required
                  placeholder="Enter your Name"
                  minLength="3"
                />
              </div>
            )}

            <div className="login__formGroup">
              <input
                type="email"
                name="email"
                className="login__formInput"
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="login__formGroup">
              <input
                type="password"
                name="password"
                className="login__formInput"
                required
                placeholder="Enter your password"
                minLength="8"
              />
            </div>

            {!isLogin && (
              <div className="login__formGroup">
                <input
                  type="text"
                  name="photoURL"
                  className="login__formInput"
                  placeholder="Profile Pic URL (optional)"
                  minLength="3"
                />
              </div>
            )}

            <div className="login__formGroup">
              {err && <Typography color="error"> {err.message} </Typography>}
            </div>

            <div className="login__formGroup">
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={isLoading}
              >
                <Typography align="center" variant="subtitle1">
                  {isLogin ? "Sign In" : "Sign Up"}
                </Typography>
              </Button>
            </div>

            {isLogin && (
              <Typography align="center" variant="body2">
                OR
              </Typography>
            )}

            {/* Sign In With Google  */}
            <div className="login__formGroup">
              {isLogin && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={signInWithGoogle}
                >
                  <Typography align="center" variant="subtitle1">
                    Sign In With Google
                  </Typography>
                </Button>
              )}
            </div>
          </form>

          {/* Forgot Password Link  */}
          {isLogin && (
            <Typography align="center" variant="body2">
              <Link
                color="secondary"
                component="button"
                variant="subtitle2"
                onClick={() => setOpen(true)}
              >
                Forgot Password
              </Link>
            </Typography>
          )}

          {/* Already Have an Account  OR  New? Create an Account*/}
          {!isLogin ? (
            <Typography align="center" variant="body2">
              {" "}
              Already Have an Account &nbsp;
              <Link
                component="button"
                color="secondary"
                variant="subtitle2"
                onClick={() => setIsLogin(true)}
              >
                Login
              </Link>
            </Typography>
          ) : (
            <Typography align="center" variant="body2">
              {" "}
              New? Create an Account &nbsp;
              <Link
                component="button"
                color="secondary"
                variant="subtitle2"
                onClick={() => setIsLogin(false)}
              >
                Here
              </Link>
            </Typography>
          )}
        </div>
      )}{" "}
      {/*  End of isLoading  */}
      {/* ForgotPassword Component (Dialog Box modal) */}
      <ForgotPassword open={open} setOpen={setOpen} />
    </div>
  );
}

export default Login;
