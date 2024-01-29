class Projectile {
  constructor({x, y, radius, color, velocity, playerId}) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.playerId = playerId
    this.collisonCount = 0
    this.maxCollisonCount = 3
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.x += this.velocity.x
    this.y += this.velocity.y
  }
}
