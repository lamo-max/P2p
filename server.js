// Run: node server.js
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

let rooms = {};

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      let data = JSON.parse(message);

      // Join Room
      if (data.type === "join") {
        ws.room = data.room;
        if (!rooms[ws.room]) rooms[ws.room] = [];
        rooms[ws.room].push(ws);
        broadcast(ws.room, {
          type: "system",
          msg: `🔔 New user joined room: ${ws.room}`
        });
      }

      // Chat Message
      if (data.type === "chat") {
        broadcast(ws.room, {
          type: "chat",
          msg: data.msg,
          sender: data.sender
        });
      }

      // Clear Messages
      if (data.type === "clear") {
        broadcast(ws.room, { type: "clear" });
      }
    } catch (e) {
      console.log("Error:", e);
    }
  });

  ws.on("close", () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room] = rooms[ws.room].filter(client => client !== ws);
      broadcast(ws.room, { type: "system", msg: "🚪 A user left." });
    }
  });
});

function broadcast(room, data) {
  if (rooms[room]) {
    rooms[room].forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

console.log("✅ WebSocket Server running on ws://localhost:8080");
            
