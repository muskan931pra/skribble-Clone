import React, { useState } from 'react'
import { socket } from '../socket.js'
import '../styles/lobby.css'

function Lobby({ setUsername }) {
  const [name, setName] = useState("");
  
  const startGame = () => {
    if (!name) return;

    socket.emit("join", { name });
    socket.emit("startGame");
    setUsername(name)
  }


  return (
    <div id="lobby">
      <h1>🎨 Skribble Clone</h1>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder='Enter your name...' />
      <button onClick={startGame}>Start Game</button>
    </div>
  )
}

export default Lobby