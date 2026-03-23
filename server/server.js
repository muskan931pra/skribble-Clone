const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});
const words = ["Cat", "Dog", "Car", "Tree", "House", "Child", "Women", "Men", "Bag", "Cab", "Plant", "Flower"]
let currentWord = "";
let players = {};
let playerIds = [];
let currentDrawerIndex = 0;
let roundTimer = null;

io.on("connection", (socket) => {

    playerIds.push(socket.id);
    players[socket.id] = {
        name: "guest",
        score: 0
    }
    sendPlayers();

    socket.on("join", ({ name }) => {
        players[socket.id].name = name;
        sendPlayers();
    });
    socket.on("startGame", () => {
        startNextRound();
    });

    socket.on("chooseWord", (word) => {
        currentWord = word;

        if (word.length <= 3) {

            let hint = word.split("").map(() => "_");

            const randomIndex = Math.floor(Math.random() * word.length);
            hint[randomIndex] = word[randomIndex];
            io.emit("hint", hint.join(" "));
        }
        else {

            let hint = word.split("").map(() => "_");

            const randomIndex1 = Math.floor(Math.random() * word.length);
            hint[randomIndex1] = word[randomIndex1];
            do {
                randomIndex2 = Math.floor(Math.random() * word.length);
            } while (randomIndex2 === randomIndex1);
            hint[randomIndex2] = word[randomIndex2];
            io.emit("hint", hint.join(" "));
        }

        io.emit("message", {
            user: "System",
            text: "New word Chosen!"
        })
        io.emit("startTimer", 30);

        if (roundTimer) clearTimeout(roundTimer);
        roundTimer = setTimeout(() => {
            endRound();
        }, 30000);
    })
    socket.on("message", (msg) => {

        if (!currentWord) {
            io.emit("message", msg);
            return;
        }

        if (msg.text.toLowerCase() === currentWord.toLowerCase()) {
            players[socket.id].score += 10;

            io.emit("message", {
                user: "System",
                text: msg.user + " guessed correctly !!! 🎉"
            });

            sendPlayers();
            endRound();
        } else {
            io.emit("message", msg);
        }
    });
    socket.on("draw", (data) => {
        if (socket.id !== getCurrentDrawer()) return;

        io.emit("draw", data);
    });
    socket.on("disconnect", () => {
        delete players[socket.id];
        playerIds = playerIds.filter(id => id !== socket.id);
        sendPlayers();
    })
})
function getCurrentDrawer() {
    return playerIds[currentDrawerIndex];
}
function sendPlayers() {
    io.emit("players", players)
}
function endRound() {
    if (roundTimer) clearTimeout(roundTimer);

    io.emit("message", { user: "System", text: "Word was: " + currentWord });
    io.emit("clearHint");
    io.emit("clearCanvas");
    currentWord = "";

    startNextRound();
}

function startNextRound() {

    if (playerIds.length === 0) return;

    if (roundTimer) clearTimeout(roundTimer);

    currentDrawerIndex = (currentDrawerIndex + 1) % playerIds.length;
    const drawerId = getCurrentDrawer();

    io.emit("turn", { drawerId });

    const options = [...words].sort(() => 0.5 - Math.random()).slice(0, 3);
    io.to(drawerId).emit("wordOptions", options);
}

server.listen(3000, () => {
    console.log("Server running on port 3000");
})

