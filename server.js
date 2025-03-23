const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let mensajes = []; // Se guardan en memoria

// Servir la página HTML directamente
app.get("/", (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Global</title>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>
<body>
    <h2>Chat Global</h2>
    <div id="chat"></div>
    <input type="text" id="mensaje" placeholder="Escribe un mensaje">
    <button onclick="enviarMensaje()">Enviar</button>

    <script>
        const socket = io();
        const chatDiv = document.getElementById("chat");
        const inputMensaje = document.getElementById("mensaje");

        socket.on("mensajesAnteriores", (mensajes) => {
            mensajes.forEach(m => mostrarMensaje(m.texto));
        });

        socket.on("nuevoMensaje", (mensaje) => {
            mostrarMensaje(mensaje.texto);
        });

        function enviarMensaje() {
            const mensaje = inputMensaje.value.trim();
            if (mensaje) {
                socket.emit("nuevoMensaje", mensaje);
                inputMensaje.value = "";
            }
        }

        function mostrarMensaje(texto) {
            const p = document.createElement("p");
            p.textContent = texto;
            chatDiv.appendChild(p);
        }
    </script>
</body>
</html>`);
});

io.on("connection", (socket) => {
    console.log("Nuevo usuario conectado");

    socket.emit("mensajesAnteriores", mensajes);

    socket.on("nuevoMensaje", (msg) => {
        const mensaje = { id: Date.now(), texto: msg };
        mensajes.push(mensaje);
        io.emit("nuevoMensaje", mensaje);
    });

    socket.on("disconnect", () => {
        console.log("Usuario desconectado");
    });
});

server.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));
