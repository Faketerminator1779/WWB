import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

const players = []
const activePlayers = []
const COLORS = [
    0xFF0000,
    0x00FF00,
    0x0000FF,
    0xFFFF00,
    0xFF00FF,
    0x0099FF,
    0x9900FF,
    0x99FF00,
]

io.on('connection', (socket) => {
    socket.on('getBoard', () => {
        socket.emit('board', board)
    });

    socket.on('getPlayers', () => {
        socket.emit('players', activePlayers)
    })

    socket.on('setName', (name) => {
        name = name.trim();

        const player = players.find(
            player => player.name === name
        )

        const usedColors = players.map(player => player.color)

        const avaibleColors = COLORS.filter(
            color => !usedColors.includes(color)
        )
        const color = avaibleColors[Math.floor(Math.random() * avaibleColors.length)]
        if (player) {
            if (player.socket !== null) {
                socket.emit('nameTaken')
                return
            }

            player.socket = socket.id
            player.color = color
            activePlayers.push(player)
            socket.emit('nameAccepted')
            socket.emit('playerInfo', {id: socket.id, color: color})
            io.emit('board', board)
            io.emit('players', activePlayers)
        } else {
            let id = players.length
            players.push({
                id: players.length,
                socket: socket.id,
                name: name,
                position: 0,
                color: color,
                reroll: false
            })
            activePlayers.push(players[id])
            socket.emit('nameAccepted')
            socket.emit('playerInfo', {id: socket.id, color: color})
            io.emit('board', board)
            io.emit('players', activePlayers)
        }
        sendTurn()
        

    })

    socket.on('roll', () => {
        const player = activePlayers[playerCurrentTurn]

        if (!player) {
            return
        }

        if (player.socket !== socket.id) {
            return
        }

        let rolledValue = Math.floor(Math.random() * 6) + 1

        if(player.reroll) {
            player.reroll = false
            if (rolledValue == 5) {
                console.log("druga 5")
            } else {
                console.log("nie druga 5")
                player.position = 0
                io.emit('players', activePlayers)
            }
            nextTurn()
        } else {
            if (rolledValue == 5) {
                const playerAtPlace = activePlayers.find(
                    playerAtPlace => playerAtPlace.position === player.position + 1
                )

                if (playerAtPlace) {
                    playerAtPlace.position = 0;
                    player.position = 0
                    io.emit('players', activePlayers)
                    nextTurn()
                } else {
                    player.position++
                    player.reroll = true
                    io.emit('players', activePlayers)
                }
            } else {
                player.position = 0
                io.emit('players', activePlayers)
                nextTurn()
            }
        }
    })

    socket.on('disconnect', () => {
        const playerIndex = activePlayers.findIndex(
            player => player.socket === socket.id
        )
        if (playerIndex !== -1) {
            const player = activePlayers[playerIndex]
            players[player.id].color = null
            players[player.id].socket = null
            console.log(`${player.name} przepadł`)
            activePlayers.splice(playerIndex, 1)
        }
        io.emit('players', activePlayers)
    })

    console.log(socket.id)
});

function GenerateBoard() {
    const numbers = Array.from({ length: 105 }, (_, i) => i);

    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    const board = Array.from({ length: 15 }, () => Array(7));

    let index = 0;

    for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 7; x++) {
            board[y][x] = numbers[index++];
        }
    }

    return board;
}
const board = GenerateBoard();

let playerCurrentTurn = 0

function sendTurn() {
    if (activePlayers.length === 0) {
        return;
    }

    const player = activePlayers[playerCurrentTurn]

    io.emit('turn', {
        playerId: player.socket,
        color: player.color
    })
}

function nextTurn() {
    if (activePlayers.length === 0) {
        return;
    }

    playerCurrentTurn++

    if (playerCurrentTurn >= activePlayers.length) {
        playerCurrentTurn = 0
    }

    sendTurn()
}

server.listen(3000);