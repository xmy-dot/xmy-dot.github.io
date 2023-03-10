//随机颜色
function randomColor() {
  // 返回一个0-255的数值，三个随机组合为一起可定位一种rgb颜色
  let num = 3;
  let color = [];
  while (num--) {
    color.push(Math.floor(Math.random() * 254 + 1));
  }
  return color.join(", ");
}
// 在min和max中取一个随机整数
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 轨迹
class Trajectory {
  constructor(startX, startY, targetX, targetY) {
    //起点
    this.startLocation = { x: startX, y: startY };
    //当前位置 初始为起点
    this.nowLocation = { x: startX, y: startY };
    //终点
    this.targetLocation = { x: targetX, y: targetY };
    //起点到终点距离
    this.targetDistance = this.getDistance(
      this.startLocation.x,
      this.startLocation.y,
      this.targetLocation.x,
      this.targetLocation.y
    );
    //颜色
    this.color = `${getRandomInt(0, 360)}, ${getRandomInt(
      50,
      100
    )}%, ${getRandomInt(45, 80)}%`;
    //速度
    this.speed = getRandomInt(2, 4);
    //加速度
    this.acceleration = getRandomInt(1, 2);
    //角度
    this.angle = Math.atan2(
      this.targetLocation.y - this.startLocation.y,
      this.targetLocation.x - this.startLocation.x
    );
    //线段集合 显示线段长度
    this.collection = new Array(getRandomInt(10, 25));
    //是否到达目标点
    this.arrived = false;
  }
  draw() {
    context.beginPath();
    try {
      context.moveTo(this.collection[0][0], this.collection[0][1]);
    } catch (e) {
      context.moveTo(this.nowLocation.x, this.nowLocation.y);
    }
    context.lineWidth = CONFIG.biuLineWidth;
    context.lineCap = "round";
    context.lineTo(this.nowLocation.x, this.nowLocation.y);
    context.strokeStyle = `hsl(${this.color})`;
    context.stroke();
  }
  update() {
    //更新位置
    this.collection.shift();
    this.collection.push([this.nowLocation.x, this.nowLocation.y]);
    // 速度加速度
    this.speed *= this.acceleration;
    //计算当前帧的路径v
    let vx = Math.cos(this.angle) * this.speed;
    let vy = Math.sin(this.angle) * this.speed;
    //计算当前运动距离
    let nowDistance = this.getDistance(
      this.startLocation.x,
      this.startLocation.y,
      this.nowLocation.x + vx,
      this.nowLocation.y + vy
    );
    // 判断是否到达target
    if (nowDistance >= this.targetDistance) {
      this.arrived = true;
    } else {
      this.nowLocation.x += vx;
      this.nowLocation.y += vy;
      this.arrived = false;
    }
  }
  getDistance(x0, y0, x1, y1) {
    // 计算两坐标点之间的距离
    let locX = x1 - x0;
    let locY = y1 - y0;
    // 勾股定理
    return Math.sqrt(Math.pow(locX, 2) + Math.pow(locY, 2));
  }
  init() {
    this.draw();
    this.update();
  }
}
class firework {
  constructor(startX, startY) {
    this.startLocation = { x: startX, y: startY };
    this.nowLocation = { x: startX, y: startY };
    this.speed = getRandomInt(3, 15);
    this.acceleration = CONFIG.fireAcceleration;
    this.angle = Math.random() * Math.PI * 2;
    //阈值为100
    this.targetCount = CONFIG.fireTargetCount;
    // 当前计算为1 用于判断是否超过阈值
    this.nowNum = 1;
    //透明度
    this.alpha = 1;
    this.gradient = CONFIG.fireGradient;
    //重力系数
    this.gravity = CONFIG.fireGravity;
    // 线段集合
    this.collection = new Array(CONFIG.fireCollectionCont);
    //是否到达目标点
    this.arrived = false;
  }
  draw() {
    context.beginPath();
    try {
      context.moveTo(this.collection[0][0], this.collection[0][1]);
    } catch (e) {
      context.moveTo(this.nowLocation.x, this.nowLocation.y);
    }
    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineTo(this.nowLocation.x, this.nowLocation.y);
    // 设置由透明度减小产生的渐隐效果
    context.strokeStyle = `
                    ${getRandomInt(0, 360)}, 
                    ${getRandomInt(50, 100)}%, 
                    ${getRandomInt(45, 80)}%,
                    ${this.alpha}
                `;
    // color: hsla(270, 50%, 40%, 0.5);
    context.stroke();
  }
  update() {
    this.collection.shift();
    this.collection.push([this.nowLocation.x, this.nowLocation.y]);
    this.speed *= this.acceleration;

    let vx = Math.cos(this.angle) * this.speed;
    // 加上重力系数，运动轨迹会趋向下
    let vy = Math.sin(this.angle) * this.speed + this.gravity;

    // 当前计算大于阀值的时候的时候，开始进行渐隐处理
    if (this.nowNum >= this.targetCount) {
      this.alpha -= this.gradient;
    } else {
      this.nowLocation.x += vx;
      this.nowLocation.y += vy;
      this.nowNum++;
    }

    // 透明度为0的话，可以进行移除处理，释放空间
    if (this.alpha <= 0.2 || this.speed <= 0.2) {
      this.arrived = true;
    }
  }
  init() {
    this.draw();
    this.update();
  }
}

class Animation {
  constructor(cw, ch) {
    // 定义一个数组做为射线类的集合
    this.tra = [];
    // 定义一个数组做为爆炸类的集合
    this.fire = [];
    this.key = 0;
    this.cw = cw;
    this.ch = ch;
  }
  pushFirework(x, y) {
    // 实例化爆炸效果，随机条数的射线扩散
    for (let bi = getRandomInt(5, 30); bi > 0; bi--) {
      this.fire.push(new firework(x, y));
    }
  }
  initAnimate(target, cb) {
    // 绘制动画
    target.map((item, index) => {
      if (!(item instanceof Object)) {
        console.error("数组值错");
        return false;
      } else {
        item.init();
        if (cb) {
          cb(index);
        }
      }
    });
  }
  run() {
    window.requestAnimationFrame(this.run.bind(this));
    context.clearRect(0, 0, this.cw, this.ch);

    // 触发射线动画
    this.initAnimate(this.tra, (i) => {
      if (this.tra[i].arrived) {
        // 到达目标后，可以开始绘制爆炸效果, 当前线条的目标点则是爆炸实例的起始点
        this.pushFirework(this.tra[i].nowLocation.x, this.tra[i].nowLocation.y);
        // 到达目标后，把当前类给移除，释放空间
        this.tra.splice(i, 1);
      }
    });
    // 触发爆炸动画
    this.initAnimate(this.fire, (i) => {
      if (this.fire[i].arrived) {
        // 到达目标透明度后，把炸点给移除，释放空间
        this.fire.splice(i, 1);
      }
    });
    if (this.tra.length < 5) {
      //同时最多5个烟花
      // 实例化射线
      const startX = getRandomInt(0.2 * this.cw, 0.8 * this.cw);
      const startY = this.ch;
      const targetX = getRandomInt(0, this.cw);
      const targetY = getRandomInt(0, 0.6 * this.ch);
      // 射线实例化，并入合集中
      let exTra = new Trajectory(startX, startY, targetX, targetY);
      this.tra.push(exTra);
    }
  }
}
const CONFIG = {
  traCollectionCont: 10,
  traLineWidth: 3,
  fireAcceleration: 0.95,
  fireTargetCount: 100,
  fireTargetCount: 100,
  fireGradient: 0.015,
  fireGravity: 0.98,
  fireCollectionCont: 2,
};
const canvas = document.getElementsByTagName("canvas")[0];
const context = canvas.getContext("2d");
function fireworks() {
  let cw = (canvas.width = window.innerWidth);
  let ch = (canvas.height = window.innerHeight);
  let fireworks = new Animation(cw, ch);
  fireworks.run();
}
window.onload = () => {
  fireworks();
};
window.onresize = () => {
  fireworks();
};
