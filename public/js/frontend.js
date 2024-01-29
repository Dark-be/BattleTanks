const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = innerWidth * devicePixelRatio
canvas.height = innerHeight * devicePixelRatio

const frontEndPlayers = {}
const frontEndProjectiles = {}
var frontEndChatMessages
const frontEndChatMessagePool = []

const map = {
  width: 5000,
  height: 5000
}

const colliders = []
colliders.push(new BorderCollider(-map.width / 2, -map.height / 2, map.width, map.height))
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

colliders.push(new RectCollider(-500, 0, 500, 50))
colliders.push(new RectCollider(-350, 400, 500, 50))
colliders.push(new RectCollider(-550, 800, 600, 50))
colliders.push(new RectCollider(-1200, 600, 500, 50))
colliders.push(new RectCollider(-1000, 400, 500, 50))

colliders.push(new RectCollider(-700, 0, 50, 400))
colliders.push(new RectCollider(-400, 250, 50, 200))
colliders.push(new RectCollider(-600, 650, 50, 400))
colliders.push(new RectCollider(-1000, 650, 50, 400))
colliders.push(new RectCollider(-800, 750, 50, 300))

colliders.push(new CircleCollider(-300, 600, 50))



socket.on('connect', () => {
  socket.emit('initCanvas', {
    width: canvas.width,
    height: canvas.height,
  })
})

let projectileId = 0
// only update position of the projectiles
socket.on('addProjectile', (backEndProjectile) => {
  frontEndProjectiles[projectileId] = new Projectile({
    x: backEndProjectile.x,
    y: backEndProjectile.y,
    radius: 5,
    color: frontEndPlayers[backEndProjectile.playerId]?.color,
    velocity: backEndProjectile.velocity,
    playerId: backEndProjectile.playerId
  })
  projectileId++;
})
// only update position and angle of the players
socket.on('updatePlayers', (backEndPlayers) => {
  for(const id in backEndPlayers){
    const backEndPlayer = backEndPlayers[id]

    if(!frontEndPlayers[id]){
      frontEndPlayers[id] = new Player({
        x:backEndPlayer.x,
        y:backEndPlayer.y,
        angle: backEndPlayer.angle,
        color: backEndPlayer.color,
        username: backEndPlayer.username
      })
      // reset key
      keys.w.pressd = false
      keys.a.pressd = false
      keys.s.pressd = false
      keys.d.pressd = false
      document.querySelector('#playerLabels').innerHTML +=
      `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score}</div>`
    } else{
      document.querySelector(`div[data-id="${id}"]`).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score}`
      document.querySelector(`div[data-id="${id}"]`).setAttribute('data-score', backEndPlayer.score)
      const parenetDiv = document.querySelector('#playerLabels')
      const childDivs = Array.from(parenetDiv.querySelectorAll('div'))
      childDivs.sort((a, b) => {
        return b.getAttribute('data-score') - a.getAttribute('data-score')
      })

      childDivs.forEach((div) => {
        parenetDiv.removeChild(div)
      })

      childDivs.forEach((div) => {
        parenetDiv.appendChild(div)
      })

      if(id === socket.id){
        // if the player is the current player

      } else{
        // for all other players
        frontEndPlayers[id].angle = backEndPlayer.angle

        gsap.to(frontEndPlayers[id], {
          x: backEndPlayer.x,
          y: backEndPlayer.y,
          duration: 0.033,
          ease: 'linear'
        })
        
      }
    }
  }

  // delete frontend players
  for(const id in frontEndPlayers){
    if(!backEndPlayers[id]){
      const divToDelete = document.querySelector(`div[data-id="${id}"]`)
      divToDelete.parentNode.removeChild(divToDelete)

      if(id===socket.id){
        // if the player is the current player
        document.querySelector('#usernameForm').style.display = 'block'
      }
      delete frontEndPlayers[id]
    }
  }
  //console.log(frontEndPlayers)
})

socket.on('updateChatMessages', (backEndChatMessages) => {
  frontEndChatMessages = backEndChatMessages;
})

let messagePoolTimer
socket.on('updateChatMessagePool', ({id, inputText}) => {
  frontEndChatMessagePool.push({id, inputText});
  document.getElementById("messageList").innerHTML += `\n${frontEndPlayers[id].username}: ${inputText}`;// note: innerText will not parse html tags into text
  document.getElementById("messageList").style.display = "block";
  
  const messageList = document.getElementById("messageList");
  messageList.scrollTop = messageList.scrollHeight;
  clearTimeout(messagePoolTimer);
  messagePoolTimer = setTimeout(() => {  
    document.getElementById("messageList").style.display = "none";
  }, 5000);
})

let animationId
function animate() {
  var playerPosition = {
    x: 0,
    y: 0
  }
  for(const id in frontEndPlayers){
    if(id === socket.id){
      playerPosition = {
        x: frontEndPlayers[id].x,
        y: frontEndPlayers[id].y,
      }
    }
  }
  c.translate(-(playerPosition.x - canvas.width / 2), -(playerPosition.y - canvas.height / 2))
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(32, 32, 32, 1)'
  c.fillRect(-2500, -2500, 5000, 5000)

  for(const id in frontEndProjectiles){
    const projectile = frontEndProjectiles[id]
    projectile.draw()
  }
  
  for(const id in frontEndPlayers){
    const player = frontEndPlayers[id]
    player.draw()
  }

  colliders.forEach(element => {
    element.draw()
  });

  for(const id in frontEndChatMessages){
    const frontEndChatMessage = frontEndChatMessages[id];
    frontEndPlayers[id].drawBubbleMessage(frontEndChatMessage);
  }
  c.translate((playerPosition.x - canvas.width / 2), (playerPosition.y - canvas.height / 2))
}
animate()

// keyfeedback
const keys = {
  w: {
    pressd: false
  },
  a: {
    pressd: false
  },
  s: {
    pressd: false
  },
  d: {
    pressd: false
  }
}

const SPEED = 5
const RADIUS = 40
setInterval(() => {
  // update projectiles
  for(const id in frontEndProjectiles){
    const projectile = frontEndProjectiles[id]
    const prePosition = {
      x: projectile.x,
      y: projectile.y
    }
    projectile.update()
    // 边界判定（附带碰撞次数判定）
    if(projectile.x < -map.width / 2 || projectile.x > map.width / 2 || projectile.y < -map.height / 2 || projectile.y > map.height / 2 || projectile.collisonCount > projectile.maxCollisonCount){
      frontEndPlayers[frontEndProjectiles[id].playerId].projectileCount--
      delete frontEndProjectiles[id]
    }
    // 碰撞判定
    for(var i = 0; i < colliders.length; i++){
      if(colliders[i].isColliding(projectile.x, projectile.y)){// 子弹碰撞到障碍物
        projectile.collisonCount++
        const preVelocity = {
          x: projectile.velocity.x,
          y: projectile.velocity.y
        }
        const normal = colliders[i].getNormal(prePosition.x, prePosition.y)
        projectile.x = prePosition.x
        projectile.y = prePosition.y
        projectile.velocity.x = preVelocity.x - 2 * normal.x * (preVelocity.x * normal.x + preVelocity.y * normal.y)
        projectile.velocity.y = preVelocity.y - 2 * normal.y * (preVelocity.x * normal.x + preVelocity.y * normal.y)
        break
      }
    }
    // 命中判定
    for(const frontEndPlayerId in frontEndPlayers){
      const frontEndPlayer = frontEndPlayers[frontEndPlayerId]
      const distance = Math.hypot(projectile.x - frontEndPlayer.x, projectile.y - frontEndPlayer.y)
      if(distance < RADIUS){
        frontEndPlayers[frontEndProjectiles[id].playerId].projectileCount--
        delete frontEndProjectiles[id]
        if(frontEndPlayerId === socket.id){
          socket.emit('hit', projectile.playerId)
          break
        }
      }
    }
  }
  // update playerInputs
  if(frontEndPlayers[socket.id]){
    const prePosition = {
      x: frontEndPlayers[socket.id].x,
      y: frontEndPlayers[socket.id].y,
      angle: frontEndPlayers[socket.id].angle
    }
    frontEndPlayers[socket.id].update(keys)
    // 碰撞判定
    colliders.forEach(element => {
      if(element.isColliding(frontEndPlayers[socket.id].x + 25 * Math.cos(frontEndPlayers[socket.id].angle) - 35 * Math.sin(frontEndPlayers[socket.id].angle),
      frontEndPlayers[socket.id].y + 25 * Math.sin(frontEndPlayers[socket.id].angle) + 35 * Math.cos(frontEndPlayers[socket.id].angle)) ||
      element.isColliding(frontEndPlayers[socket.id].x - 25 * Math.cos(frontEndPlayers[socket.id].angle) - 35 * Math.sin(frontEndPlayers[socket.id].angle),
      frontEndPlayers[socket.id].y - 25 * Math.sin(frontEndPlayers[socket.id].angle) + 35 * Math.cos(frontEndPlayers[socket.id].angle)) ||
      element.isColliding(frontEndPlayers[socket.id].x + 25 * Math.cos(frontEndPlayers[socket.id].angle) + 35 * Math.sin(frontEndPlayers[socket.id].angle),
      frontEndPlayers[socket.id].y + 25 * Math.sin(frontEndPlayers[socket.id].angle) - 35 * Math.cos(frontEndPlayers[socket.id].angle)) ||
      element.isColliding(frontEndPlayers[socket.id].x - 25 * Math.cos(frontEndPlayers[socket.id].angle) + 35 * Math.sin(frontEndPlayers[socket.id].angle),
      frontEndPlayers[socket.id].y - 25 * Math.sin(frontEndPlayers[socket.id].angle) - 35 * Math.cos(frontEndPlayers[socket.id].angle)))
      {
        frontEndPlayers[socket.id].x = prePosition.x
        frontEndPlayers[socket.id].y = prePosition.y
        frontEndPlayers[socket.id].angle = prePosition.angle
      }
    })
    socket.emit('updatePlayers', {
      x: frontEndPlayers[socket.id].x,
      y: frontEndPlayers[socket.id].y,
      angle: frontEndPlayers[socket.id].angle
    })
  }
}, 33)

