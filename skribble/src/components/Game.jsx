import React, { useEffect, useState } from 'react'
import { socket } from '../socket';
import Canvas from './Canvas.jsx';
import '../styles/game.css'

function Game({ username }) {
  const [players, setPlayers] = useState({});
  const [messages, setMessages] = useState([]);
  const [isDrawer, setIsDrawer] = useState(false);
  const [wordArea, setWordArea] = useState("");
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    socket.on("players", setPlayers);

    socket.on("startTimer", (seconds) => {
      setTimer(seconds);
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("turn", (data) => {
      const isMeDrawer = socket.id === data.drawerId;
      setIsDrawer(isMeDrawer);
      setWordArea("");
    });

    socket.on("wordOptions", (options) => {
      setWordArea(
        options.map((word, i) => (
          <button key={i} onClick={() => { console.log("word clicked:", word); socket.emit("chooseWord", word) }}>
            {word}
          </button>
        ))
      );
    });

    socket.on("hint", (hint) => {
      setWordArea("Hint: " + hint);
    });
    socket.on("clearHint", () => {
      setTimer(null);
      setWordArea("");
      setTimeout(()=> setMessages([]), 2000);
    });
    return () => {
      socket.off("players");
      socket.off("message");
      socket.off("turn");
      socket.off("wordOptions");
      socket.off("hint");
      socket.off("clearHint");
      socket.off("startTimer");
    };

  }, []);
  const sendMessage = () => {
    const input = document.getElementById("message");

    socket.emit("message", {
      user: username,
      text: input.value
    });

    input.value = "";
  };
  return (
    <>
      <div id="header">
        <h2>🎨 Skribble Clone</h2>
      </div>
      <div style={{ display: "flex" }} id='game'>
        <div className='block left'>
          <h3>Players</h3>
          {Object.values(players).map((p, i) => (
            <p key={i}>{p.name}: {p.score}</p>
          ))}
        </div>
        <div className='block mid'>
          <div id='hintOrWord'>{wordArea.length !== 0 ? wordArea : "Please wait..."}
            {timer !== null && timer !== 0 && (
              <span style={{ marginLeft: "auto", color: timer <= 5 ? "red" : "#b67804", fontWeight: "bold", fontSize: "22px" }}>⏱ {timer}s</span>
            )}
          </div>
          <Canvas isDrawer={isDrawer} />
        </div>
        <div className='block right'>
          <div className="send">
            <input id="message" placeholder="Type message..." />
            <button onClick={sendMessage}>Send</button>
          </div>
          {messages.map((m, i) => (
            <p key={i}>{m.user}: {m.text}</p>
          ))}
        </div>
      </div>
    </>
  )
}

export default Game