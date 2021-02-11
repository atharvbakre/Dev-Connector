import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";

import { SET_CURRENT_USER, GET_ERRORS } from "./types";

// Register User
export const registerUser = (userData, history) => (dispatch) => {
  axios
    .post("/api/users/register", userData)
    .then((res) => history.push("/login"))
    .catch((error) =>
      dispatch({
        type: GET_ERRORS,
        payload: error.response.data,
      })
    );
};

// Login User
export const loginUser = (userData) => (dispatch) => {
  axios
    .post("/api/users/login", userData)
    .then((res) => {
      // Save Token to local storage
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);
      // Set Token to Auth Header
      setAuthToken(token);
      // Decode Token to get user data
      const decoded = jwt_decode(token);
      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch((error) =>
      dispatch({
        type: GET_ERRORS,
        payload: error.response.data,
      })
    );
};

// Logout User
export const logoutUser = () => (dispatch) => {
  // Remove Token from localStorage
  localStorage.removeItem("jwtToken");
  // Remove Auth Header
  setAuthToken(false);
  // Set Current User to null and isAuthenticated to failures
  dispatch(setCurrentUser({}));
};

// Set Current User
export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded,
  };
};
