const express = require('express')
const app = express()

const http = require('http')
const { emit } = require('process')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {pingInterval: 2000, pingTimeout: 5000})

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const { RectCollider, CircleCollider } = require('./public/js/classes/Collider.js')

const backEndPlayers = {}
const backEndChatMessages = {}
const chatMessageBubbleTimers = {}

const colliders = []
colliders.push(new RectCollider(0, 0, 500, 50))
colliders.push(new RectCollider(0, 200, 500, 50))
colliders.push(new RectCollider(0, 600, 600, 50))
colliders.push(new RectCollider(700, 600, 500, 50))
colliders.push(new RectCollider(500, 400, 500, 50))

colliders.push(new RectCollider(600, 0, 50, 400))
colliders.push(new RectCollider(300, 250, 50, 200))
colliders.push(new RectCollider(500, 650, 50, 400))
colliders.push(new RectCollider(900, 650, 50, 400))
colliders.push(new RectCollider(700, 750, 50, 300))

const SPEED = 10

io.on('connection', (socket) => {
  console.log('a user connected')
  
  socket.on('initGame', ({username, width, height}) => {
    const playerColor = Math.random() * 360
    var positionValid = false;
    var x = width * Math.random()
    var y = height * Math.random()
    while(!positionValid){
      positionValid = true;
      colliders.forEach(element => {
        if(element.isColliding(x, y)){
          positionValid = false;
        }
      })
      if(!positionValid){
        x = width * Math.random()
        y = height * Math.random()
      }
    }
    backEndPlayers[socket.id] = {
      x,
      y,
      angle: 0,
      color: `hsl(${playerColor}, 100%, 50%)`,
      score: 0,
      username
    }

    backEndPlayers[socket.id].canvas = {
      width,
      height,
    }
  })

  socket.on('disconnect', (reason) => {
    console.log(reason)
    delete backEndPlayers[socket.id]
  })

  socket.on('updatePlayers', ({x, y, angle}) => {
    if(backEndPlayers[socket.id]){
      backEndPlayers[socket.id].x = x
      backEndPlayers[socket.id].y = y
      backEndPlayers[socket.id].angle = angle
    }
  })

  socket.on('shoot', ({x, y, angle}) => {
    const velocity = {
      x: SPEED * Math.sin(angle),
      y: SPEED * Math.cos(angle)
    }
    const backEndProjectile = {
      x,
      y,
      velocity,
      playerId: socket.id
    }
    io.emit('addProjectile', backEndProjectile)
  })

  socket.on('hit', (playerId) => {
    if(backEndPlayers[playerId]){
      backEndPlayers[playerId].score++
    }
    if(backEndPlayers[socket.id]){
      delete backEndPlayers[socket.id]
    }
    console.log('hit', playerId, socket.id)
  })

  socket.on('chatPublic', (inputText) => {
    backEndChatMessages[socket.id] = inputText;
    clearTimeout(chatMessageBubbleTimers[socket.id])
    chatMessageBubbleTimers[socket.id] = setTimeout(() => {
      delete backEndChatMessages[socket.id]
      io.emit('updateChatMessages', backEndChatMessages)
    }, 6000)
    io.emit('updateChatMessages', backEndChatMessages)
    io.emit('updateChatMessagePool', {id:socket.id, inputText})
  })
})

// backend ticker
setInterval(() => {
  io.emit('updatePlayers', backEndPlayers)
  io.emit('updateChatMessages', backEndChatMessages)
}, 50)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log('server loaded')