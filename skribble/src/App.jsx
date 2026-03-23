import { useState } from 'react'
import './App.css'
import Lobby from "./components/Lobby"
import Game from "./components/Game"

function App() {
  const [username, setUsername] = useState("");

  return (
    <>
      {!username ? (
        <Lobby setUsername={setUsername}/>
      ):
        <Game username={username}/>
      }
    </>
  )
}

export default App