addEventListener('click', (event) => {
  if(!frontEndPlayers[socket.id]) return
  if(frontEndPlayers[socket.id].projectileCount >= frontEndPlayers[socket.id].maxProjectileCount) return
  // console.log(`${frontEndPlayers[socket.id].projectileCount}`)
  frontEndPlayers[socket.id].projectileCount++
  socket.emit('shoot', {
    x: frontEndPlayers[socket.id].x + Math.sin(frontEndPlayers[socket.id].angle) * 50,
    y: frontEndPlayers[socket.id].y + Math.cos(frontEndPlayers[socket.id].angle) * 50,
    angle: frontEndPlayers[socket.id].angle
  })
})

let inputing = false;
window.addEventListener('keydown', (event) => {
  if(frontEndPlayers[socket.id]){
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
            // console.log("Input:" + inputText);
            socket.emit('chatPublic', inputText);
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
  if(frontEndPlayers[socket.id]){
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
  const username = document.querySelector('#usernameInput').value
  socket.emit('initGame', {
    username,
    width: canvas.width,
    height: canvas.height
  })
})