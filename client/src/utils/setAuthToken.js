import axios from "axios";

const setAuthToken = (token) => {
  // Set Headers for all requests
  if (token) axios.defaults.headers.common["Authorization"] = token;
  // Delete Auth Header
  else delete axios.defaults.headers.common["Authorization"];
};

export default setAuthToken;
