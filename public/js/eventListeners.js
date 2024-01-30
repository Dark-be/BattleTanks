addEventListener('click', (event) => {
  if(!frontEndPlayer) return
  if(frontEndPlayer.projectileCount >= frontEndPlayer.maxProjectileCount) return

  frontEndPlayer.projectileCount++
  frontEndProjectiles[projectileId] = new Projectile({
    x: frontEndPlayer.x + Math.sin(frontEndPlayer.angle) * 50,
    y: frontEndPlayer.y + Math.cos(frontEndPlayer.angle) * 50,
    radius: 5,
    color: frontEndPlayer.color,
    velocity: {
      x: 10 * Math.sin(frontEndPlayer.angle),
      y: 10 * Math.cos(frontEndPlayer.angle)
    },
    playerId: 'me'
  })
  projectileId++;
})

let inputing = false;
window.addEventListener('keydown', (event) => {
  if(frontEndPlayer){
    if(!inputing){
      switch(event.code){
        case 'KeyW':
          keys.w.pressd = true
          break
        case 'KeyA':
          keys.a.pressd = true
          break
        case 'KeyS':
          keys.s.pressd = true
          break
        case 'KeyD':
          keys.d.pressd = true
          break
      }
    }
    switch(event.code){
      case 'Enter':
        if(document.getElementById("textInput").style.display === "none"){
          document.getElementById("textInput").style.display = "block";
          document.getElementById("messageList").style.display = "block";
          document.getElementById("textInput").focus();
          inputing = true;
        } else{
          var inputText = document.getElementById("textInput").value;
          if(inputText.length > 0){
            frontEndChatMessage = inputText
            updateChatMessagePool()
          }
          document.getElementById("textInput").style.display = "none";
          document.getElementById("textInput").value = "";
          document.getElementById("gameCanvas").focus();
          inputing = false;
        }
        break;
      case 'Escape':
        document.getElementById("textInput").style.display = "none";
        document.getElementById("gameCanvas").focus();
        inputing = false;
        break;
    }
  }
})

window.addEventListener('keyup', (event) => {
  if(frontEndPlayer){
    switch(event.code){
      case 'KeyW':
        keys.w.pressd = false
        break
      case 'KeyA':
        keys.a.pressd = false
        break
      case 'KeyS':
        keys.s.pressd = false
        break
      case 'KeyD':
        keys.d.pressd = false
    }
  }
})

document.querySelector('#usernameForm').addEventListener('submit', (event) => {
  event.preventDefault()
  if(!document.querySelector('#usernameInput').value) {
    document.querySelector('#usernameInput').placeholder='Please enter a username'
    return
  }
  document.querySelector('#usernameForm').style.display = 'none'
  const playerColor = Math.random() * 360
  frontEndPlayer = new Player({
    x:innerWidth * Math.random(),
    y:innerHeight * Math.random(),
    angle: 0,
    color: `hsl(${playerColor}, 100%, 50%)`,
    username: document.querySelector('#usernameInput').value
  })
})