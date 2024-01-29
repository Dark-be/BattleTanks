
class Collider {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // Check if two colliders are colliding
  isColliding(x, y) {
    
  }

  draw() {

  }
}
class BorderCollider {
  constructor(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  isColliding(x, y) {
    return x < this.x || x > this.x + this.width || y < this.y || y > this.y + this.height;
  }

  draw() {
    c.beginPath()
    c.rect(this.x, this.y, this.width, this.height)
    c.strokeStyle = 'red'
    c.lineWidth = 10
    c.stroke()
  }

  getNormal(x, y) {
    const normal = {
      x: ((this.height / this.width * (x - this.x) + this.y) > y ? 1 : 0),
      y: ((- this.height / this.width * (x - this.x - this.width) + this.y) > y ? 1 : 0)
    }
    if(normal.x == 1){// 下方和右方
      if(normal.y == 1){
        return {x: 0, y: -1}//下方
      }
      else return {x: 1, y: 0}//右方
    } else{//左方和上方
      if(normal.y == 1){
        return {x: -1, y: 0}//左方
      }
      else return {x: 0, y: 1}//上方
    }
  }

}

class RectCollider {
  constructor(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  isColliding(x, y) {
    return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
  }

  draw() {
    c.beginPath()
    c.rect(this.x, this.y, this.width, this.height)
    c.fillStyle = 'white'
    c.fill()
    
    c.strokeStyle = 'black'
    c.lineWidth = 4
    c.stroke()
  }

  getNormal(x, y) {
    const normal = {
      x: ((this.height / this.width * (x - this.x) + this.y) > y ? 1 : 0),
      y: ((- this.height / this.width * (x - this.x - this.width) + this.y) > y ? 1 : 0)
    }
    if(normal.x == 1){// 下方和右方
      if(normal.y == 1){
        return {x: 0, y: -1}//下方
      }
      else return {x: 1, y: 0}//右方
    } else{//左方和上方
      if(normal.y == 1){
        return {x: -1, y: 0}//左方
      }
      else return {x: 0, y: 1}//上方
    }
  }

}


class CircleCollider {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  isColliding(x, y) {
    return Math.hypot(x - this.x, y - this.y) < this.radius;
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = 'white'
    c.fill()
    
    c.strokeStyle = 'black'
    c.lineWidth = 4
    c.stroke()
  }

  getNormal(x, y) {
    const normal = {
      x: x - this.x,
      y: y - this.y
    }
    const length = Math.hypot(normal.x, normal.y)
    normal.x /= length
    normal.y /= length
    return normal
  }

}

module.exports = {
  RectCollider,
  CircleCollider
}
