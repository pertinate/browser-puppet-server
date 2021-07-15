import express, { request } from "express";
import { Server } from "socket.io";
import http from "http";
import qrcode from "qrcode";

const app = express();

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  maxHttpBufferSize: 1e8,
});

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("dataUrl-request", () => {
    qrcode.toDataURL(socket.id, (error, url) => {
      if (error) {
        console.error(error);
        return;
      }
      socket.emit("dataUrl", { dataUrl: url });
    });
  });
  socket.on("disconnect", () => {
    console.log("socket disconnected", socket.id);
  });
});

app.post("/send-command", async (request, response) => {
  const data = request.body;
  if (!data || !data.client) {
    return response.status(400).send();
  }
  const exists = Array.from(await io.sockets.allSockets()).includes(
    data.client
  );
  if (!exists) {
    return response.sendStatus(404);
  }
  if (data.x && data.y) {
    io.to(data.client).emit("command", {
      x: data.x,
      y: data.y,
    });
  }
  return response.sendStatus(200);
});

app.post("/current-screen", async (request, response) => {
  const data = request.body;
  if (!data || !data.client) {
    return response.status(400).send();
  }
  const exists = Array.from(await io.sockets.allSockets()).includes(
    data.client
  );
  if (!exists) {
    return response.sendStatus(404);
  }
  io.to(data.client).emit("current-screen");
  io.sockets.sockets.get(data.client).once("current-screen-reply", (data) => {
    response.status(200).send(data);
    // console.log("data:", data.toString("base64"));
  });
});

app.post("/current-tabs", async (request, response) => {
  const data = request.body;
  if (!data || !data.client) {
    return response.status(400).send();
  }
  const exists = Array.from(await io.sockets.allSockets()).includes(
    data.client
  );
  if (!exists) {
    return response.sendStatus(404);
  }
  io.to(data.client).emit("tablist");
  io.sockets.sockets.get(data.client).once("tablist-reply", (data) => {
    response.status(200).send(data);
    // console.log("data:", data.toString("base64"));
  });
});

server.listen(8080, () => {
  console.log("server online");
});
