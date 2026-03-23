import {io} from "socket.io-client"

const URL = import.meta.env.MODE === "production"
    ? "https://skribble-server-9v21.onrender.com"  // ← paste your render URL here
    : "http://localhost:3000";

export const socket = io(URL);