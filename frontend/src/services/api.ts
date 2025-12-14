// api wrapper: attaches JWT token from cookies and calls backend
import axios from "axios";
import Cookies from "js-cookie";

//temp url
console.log("API BASE =", process.env.NEXT_PUBLIC_API_BASE);


const base = process.env.NEXT_PUBLIC_API_BASE || "";

const instance = axios.create({
  baseURL: base,
  headers: { "Content-Type": "application/json" }
});

instance.interceptors.request.use((cfg) => {
  const token = Cookies.get("token");

  if (token && cfg.headers) {
    cfg.headers.set("Authorization", `Bearer ${token}`);
  }

  return cfg;
});


export default instance;
