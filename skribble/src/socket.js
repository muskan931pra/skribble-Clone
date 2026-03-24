import {io} from "socket.io-client"

// export const socket = io("http://localhost:3000")

const URL = import.meta.env.MODE === "production"
    ? "https://skribble-server-9v21.onrender.com"  
    : "http://localhost:3000";

export const socket = io(URL);