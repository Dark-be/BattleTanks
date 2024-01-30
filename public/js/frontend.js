const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = innerWidth * devicePixelRatio
canvas.height = innerHeight * devicePixelRatio

var frontEndPlayer
const frontEndProjectiles = {}
var frontEndChatMessage
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

colliders.push(new RectCollider(-200, -300, 500, 50))
colliders.push(new RectCollider(-800, -500, 600, 50))

colliders.push(new CircleCollider(-300, 600, 50))

let projectileId = 0

function playerFailed(){
  document.querySelector('#usernameForm').style.display = 'block'
  delete frontEndPlayer
}
// only update position and angle of the players
function updatePlayers(){
  if(frontEndPlayer){
    
  }
}

let messagePoolTimer
function updateChatMessagePool(){
  frontEndChatMessagePool.push();
  document.getElementById("messageList").innerHTML += `\n${frontEndPlayer.username}: ${frontEndChatMessage}`;// note: innerText will not parse html tags into text
  document.getElementById("messageList").style.display = "block";
  
  const messageList = document.getElementById("messageList");
  messageList.scrollTop = messageList.scrollHeight;
  clearTimeout(messagePoolTimer);
  messagePoolTimer = setTimeout(() => {  
    document.getElementById("messageList").style.display = "none";
  }, 5000);
}

let animationId
function animate() {
  var playerPosition = {
    x: 0,
    y: 0
  }
  if(frontEndPlayer){
    playerPosition = {
      x: frontEndPlayer.x,
      y: frontEndPlayer.y,
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
  if(frontEndPlayer){
    frontEndPlayer.draw()
  }
  colliders.forEach(element => {
    element.draw()
  });

  if(frontEndChatMessage){
    frontEndPlayer.drawBubbleMessage(frontEndChatMessage);
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
    updatePlayers()
    // 边界判定（附带碰撞次数判定）
    if(projectile.x < -map.width / 2 || projectile.x > map.width / 2 || projectile.y < -map.height / 2 || projectile.y > map.height / 2 || projectile.collisonCount > projectile.maxCollisonCount){
      frontEndPlayer.projectileCount--
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
    const distance = Math.hypot(projectile.x - frontEndPlayer.x, projectile.y - frontEndPlayer.y)
    if(distance < RADIUS){
      playerFailed()
      delete frontEndProjectiles[id]
    }
  }
  // update playerInputs
  if(frontEndPlayer){
    const prePosition = {
      x: frontEndPlayer.x,
      y: frontEndPlayer.y,
      angle: frontEndPlayer.angle
    }
    frontEndPlayer.update(keys)
    // 碰撞判定
    colliders.forEach(element => {
      if(element.isColliding(frontEndPlayer.x + 25 * Math.cos(frontEndPlayer.angle) - 35 * Math.sin(frontEndPlayer.angle),
      frontEndPlayer.y + 25 * Math.sin(frontEndPlayer.angle) + 35 * Math.cos(frontEndPlayer.angle)) ||
      element.isColliding(frontEndPlayer.x - 25 * Math.cos(frontEndPlayer.angle) - 35 * Math.sin(frontEndPlayer.angle),
      frontEndPlayer.y - 25 * Math.sin(frontEndPlayer.angle) + 35 * Math.cos(frontEndPlayer.angle)) ||
      element.isColliding(frontEndPlayer.x + 25 * Math.cos(frontEndPlayer.angle) + 35 * Math.sin(frontEndPlayer.angle),
      frontEndPlayer.y + 25 * Math.sin(frontEndPlayer.angle) - 35 * Math.cos(frontEndPlayer.angle)) ||
      element.isColliding(frontEndPlayer.x - 25 * Math.cos(frontEndPlayer.angle) + 35 * Math.sin(frontEndPlayer.angle),
      frontEndPlayer.y - 25 * Math.sin(frontEndPlayer.angle) - 35 * Math.cos(frontEndPlayer.angle)))
      {
        frontEndPlayer.x = prePosition.x
        frontEndPlayer.y = prePosition.y
        frontEndPlayer.angle = prePosition.angle
      }
    })
  }
}, 33)

