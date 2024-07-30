// 导入Three.js库中的EventDispatcher（事件调度器）、Mesh（网格）、MeshNormalMaterial（网格法向材质）、MeshStandardMaterial（标准材质）、SphereGeometry（球体几何体）、Vector2（二维向量）、Vector3（三维向量）类
import {
  EventDispatcher,
  Mesh,
  MeshNormalMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three'

// 导入LinkedList类
import LinkedKList from './LinkedList'

// 导入Three.js库中的RoundedBoxGeometry（圆角矩形几何体）类
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry'

// 导入ListNode类
import ListNode from './ListNode'

// 导入Entity类
import Entity from './Entity'

// 创建一个圆角矩形几何体，长宽高均为0.9，圆角半径为0.1
const NODE_GEOMETRY = new RoundedBoxGeometry(0.9, 0.9, 0.9, 5, 0.1)

// 创建一个标准材质，颜色为0xff470a
const NODE_MATERIAL = new MeshStandardMaterial({
  color: 0xff470a,
})

// 定义四个方向向量，分别为上、下、左、右
const UP = new Vector3(0, 0, -1)
const DOWN = new Vector3(0, 0, 1)
const LEFT = new Vector3(-1, 0, 0)
const RIGHT = new Vector3(1, 0, 0)

// 导出一个名为Snake的类，该类继承自EventDispatcher类
export default class Snake extends EventDispatcher {
  // 初始化方向为右，索引为空数组，速度间隔为240
  direction = RIGHT
  indexes = []
  speedInterval = 240

  // 构造函数，接收一个包含场景、分辨率、颜色、嘴巴颜色的对象作为参数
  constructor({ scene, resolution = new Vector2(10, 10), color, mouthColor }) {
    // 调用父类的构造函数
    super()

    // 将场景、分辨率、嘴巴颜色保存为实例的属性
    this.scene = scene
    this.resolution = resolution
    this.mouthColor = mouthColor

    // 如果传入了颜色，就将节点材质的颜色设置为传入的颜色
    if (color) {
      NODE_MATERIAL.color.set(color)
    }

    // 调用init方法初始化
    this.init()
  }

  // 定义一个getter方法，返回蛇体的头部
  get head() {
    return this.body.head
  }

  // 定义一个getter方法，返回蛇体的尾部
  get end() {
    return this.body.end
  }

  // 创建头部网格的方法
  createHeadMesh() {
    // 获取头部的网格
    const headMesh = this.body.head.data.mesh

    // 创建左眼，包括眼球和眼孔
    const leftEye = new Mesh(
      new SphereGeometry(0.2, 10, 10),
      new MeshStandardMaterial({ color: 0xffffff })
    )
    leftEye.scale.x = 0.1
    leftEye.position.x = 0.5
    leftEye.position.y = 0.12
    leftEye.position.z = -0.1

    let leftEyeHole = new Mesh(
      new SphereGeometry(0.22, 10, 10),
      new MeshStandardMaterial({ color: 0x333333 })
    )
    leftEyeHole.scale.set(1, 0.6, 0.6)
    leftEyeHole.position.x += 0.05
    leftEye.add(leftEyeHole)

    // 创建右眼，直接克隆左眼并调整位置和旋转
    const rightEye = leftEye.clone()
    rightEye.position.x = -0.5
    rightEye.rotation.y = Math.PI

    // 创建嘴巴
    const mouthMesh = new Mesh(
      new RoundedBoxGeometry(1.05, 0.1, 0.6, 5, 0.1),
      new MeshStandardMaterial({
        color: this.mouthColor,
      })
    )
    mouthMesh.rotation.x = -Math.PI * 0.07
    mouthMesh.position.z = 0.23
    mouthMesh.position.y = -0.19

    // 将嘴巴保存为实例的属性
    this.mouth = mouthMesh

    // 将右眼、左眼、嘴巴添加到头部网格中
    headMesh.add(rightEye, leftEye, mouthMesh)

    // 让头部网格朝向当前的方向
    headMesh.lookAt(headMesh.position.clone().add(this.direction))
  }

  init() {
    // 设置蛇的初始方向为右
    this.direction = RIGHT
    // 初始化移动间隔为null
    this.iMoving = null

    // 创建蛇头，是一个ListNode类型的对象，其中的data是一个SnakeNode类型的对象
    const head = new ListNode(new SnakeNode(this.resolution))

    // 设置蛇头的位置，位于场景的中心
    head.data.mesh.position.x = this.resolution.x / 2
    head.data.mesh.position.z = this.resolution.y / 2
    // 创建蛇身体，是一个LinkedKList类型的对象，初始时只有蛇头一个节点
    this.body = new LinkedKList(head)

    // 创建蛇头的网格
    this.createHeadMesh()

    // 将蛇头的索引添加到索引数组中
    this.indexes.push(this.head.data.getIndexByCoord())
    // 初始时，蛇身体有4个节点，除了蛇头，还有3个尾部节点
    for (let i = 0; i < 3; i++) {
      // 获取尾部节点的位置
      const position = this.end.data.mesh.position.clone()
      // 根据蛇的方向，计算新的尾部节点的位置
      position.sub(this.direction)
      // 添加尾部节点
      this.addTailNode()
      // 设置新的尾部节点的位置
      this.end.data.mesh.position.copy(position)
      // 将新的尾部节点的索引添加到索引数组中
      this.indexes.push(this.end.data.getIndexByCoord())
    }

    // 让蛇头进入场景
    head.data.in()
    // 将蛇头的网格添加到场景中
    this.scene.add(head.data.mesh)
  }

  // 定义一个名为move的方法
  // move() {
  // 调用update方法更新蛇的状态
  // this.update()

  // 设置一个定时器，当时间间隔达到speedInterval时，再次调用move方法
  // this.isMoving = setTimeout(() => {
  //   this.move()
  // }, this.speedInterval)
  // }

  // 定义一个名为stop的方法
  // stop() {
  // 清除定时器
  // clearTimeout(this.isMoving)
  // 将isMoving设置为null
  // this.isMoving = null
  // }

  // 定义一个名为setDirection的方法，接收一个参数keyCode
  setDirection(keyCode) {
    // 定义一个新的方向变量
    let newDirection

    // 根据keyCode的值，设置新的方向
    switch (keyCode) {
      case 'ArrowUp':
      case 'KeyW':
        // 如果keyCode是'ArrowUp'或'KeyW'，则新的方向为UP
        newDirection = UP
        break
      case 'ArrowDown':
      case 'KeyS':
        // 如果keyCode是'ArrowDown'或'KeyS'，则新的方向为DOWN
        newDirection = DOWN
        break
      case 'ArrowLeft':
      case 'KeyA':
        // 如果keyCode是'ArrowLeft'或'KeyA'，则新的方向为LEFT
        newDirection = LEFT
        break
      case 'ArrowRight':
      case 'KeyD':
        // 如果keyCode是'ArrowRight'或'KeyD'，则新的方向为RIGHT
        newDirection = RIGHT
        break
      default:
        // 如果keyCode不是以上任何一个值，直接返回
        return
    }

    // 计算当前方向和新的方向的点积
    const dot = this.direction.dot(newDirection)
    // 如果点积为0，说明当前方向和新的方向垂直
    if (dot === 0) {
      // 将新的方向保存为实例的属性
      this.newDirection = newDirection
      // 停止当前的移动
      // this.stop()
      // 开始新的移动
      // this.move()
    }
  }

  update() {
    // 如果存在新的方向，则将新的方向赋值给当前方向，并将新的方向设置为null
    if (this.newDirection) {
      this.direction = this.newDirection
      this.newDirection = null
    }

    // 定义当前节点为蛇的尾部
    let currentNode = this.end

    // 如果尾部节点有糖果，将糖果设置为null，将尾部节点的大小设置为1，并在尾部添加一个新的节点
    if (this.end.data.candy) {
      this.end.data.candy = null
      this.end.data.mesh.scale.setScalar(1)
      this.addTailNode()
    }

    // 当当前节点有前一个节点时，进行循环
    while (currentNode.prev) {
      // 如果前一个节点有糖果，将糖果移动到当前节点，并调整两个节点的大小
      const candy = currentNode.prev.data.candy
      if (candy) {
        currentNode.data.candy = candy
        currentNode.data.mesh.scale.setScalar(1.15)
        currentNode.prev.data.candy = null
        currentNode.prev.data.mesh.scale.setScalar(1)
      }

      // 将当前节点的位置设置为前一个节点的位置
      const position = currentNode.prev.data.mesh.position
      currentNode.data.mesh.position.copy(position)

      // 将当前节点设置为前一个节点，进行下一轮循环
      currentNode = currentNode.prev
    }

    // 获取蛇头的位置，并根据当前方向移动蛇头
    const headPos = currentNode.data.mesh.position
    headPos.add(this.direction)

    // 让蛇头的网格看向移动的方向
    const headMesh = this.body.head.data.mesh
    headMesh.lookAt(headMesh.position.clone().add(this.direction))

    // 如果蛇头的位置超出了场景的范围，将蛇头的位置设置在场景的另一边，实现穿墙效果
    if (headPos.z < 0) {
      headPos.z = this.resolution.y - 1
    } else if (headPos.z > this.resolution.y - 1) {
      headPos.z = 0
    }
    if (headPos.x < 0) {
      headPos.x = this.resolution.x - 1
    } else if (headPos.x > this.resolution.x - 1) {
      headPos.x = 0
    }

    // 更新蛇的索引
    this.updateIndexes()

    // 触发一个名为'updated'的事件
    this.dispatchEvent({ type: 'updated' })
  }

  die() {
    // 定义一个变量node，初始化为蛇的头部节点
    let node = this.body.head

    // 循环遍历蛇的每一个节点
    do {
      // 从场景中移除当前节点的网格
      this.scene.remove(node.data.mesh)
      // 将node设置为下一个节点
      node = node.next
    } while (node)

    // 调用init方法重新初始化蛇
    this.init()
    // 触发一个名为'die'的事件
    this.addEventListener({ type: 'die' })
  }

  checkSelfCollision() {
    // 从索引数组中弹出最后一个元素，即蛇头的索引
    const headIndex = this.indexes.pop()
    // 检查索引数组中是否还包含蛇头的索引，如果包含，说明蛇头与蛇身发生了碰撞
    const collide = this.indexes.includes(headIndex)
    // 将蛇头的索引重新添加到索引数组中
    this.indexes.push(headIndex)

    // 返回碰撞检查的结果
    return collide
  }

  checkEntitiesCollision(entities) {
    // 获取索引数组的最后一个元素，即蛇头的索引
    const headIndex = this.indexes.at(-1)

    // 在实体数组中查找是否有与蛇头索引相同的实体
    const entity = entities.find(
      (entity) => entity.getIndexByCoord() === headIndex
    )

    // 如果找到了实体，返回true，否则返回false
    return !!entity
  }

  updateIndexes() {
    // 清空索引数组
    this.indexes = []

    // 定义一个变量node，初始化为蛇的尾部节点
    let node = this.body.end

    // 循环遍历蛇的每一个节点
    while (node) {
      // 将当前节点的索引添加到索引数组中
      this.indexes.push(node.data.getIndexByCoord())
      // 将node设置为前一个节点
      node = node.prev
    }
  }

  addTailNode(position) {
    // 创建一个新的ListNode实例，其中包含一个新的SnakeNode实例，传入的参数是蛇的分辨率
    const node = new ListNode(new SnakeNode(this.resolution))

    // 如果传入了位置参数，就将新节点的位置设置为传入的位置
    if (position) {
      node.data.mesh.position.copy(position)
    } else {
      // 如果没有传入位置参数，就将新节点的位置设置为蛇尾部节点的位置
      node.data.mesh.position.copy(this.end.data.mesh.position)
    }

    // 将新节点添加到蛇的身体中
    this.body.addNode(node)
    // 调用新节点的in方法，可能是用于初始化新节点的状态
    node.data.in()
    // 将新节点的网格添加到场景中
    this.scene.add(node.data.mesh)
  }
}
// 定义一个 SnakeNode 类，继承自 Entity 类
class SnakeNode extends Entity {
  // 定义构造函数，接收一个参数 resolution
  constructor(resolution) {
    // 创建一个新的 Mesh 实例，传入的参数是节点的几何形状和材质
    const mesh = new Mesh(NODE_GEOMETRY, NODE_MATERIAL)
    // 调用父类的构造函数，传入的参数是 mesh 和 resolution
    super(mesh, resolution)
  }
}
