// 导入样式文件
import './style.css'
// 导入Three.js库，用于创建和控制3D图形
import * as THREE from 'three'
// 导入OrbitControls，用于控制相机
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// 导入dat库，用于创建GUI
import * as dat from 'lil-gui'

// 导入游戏实体
import Snake from './src/Snake'
import Candy from './src/Candy'
import Rock from './src/Rock'
import Tree from './src/Tree'

// 导入光源设置
import lights from './src/Ligths'
// 导入分辨率设置
import { resolution } from './src/Params'

// 导入gsap库，用于创建动画
import gsap from 'gsap'

// 导入FontLoader，用于加载字体
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'

// 导入字体源文件
import fontSrc from 'three/examples/fonts/helvetiker_bold.typeface.json?url'

// 导入TextGeometry，用于创建3D文字
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

// 导入实体基类
import Entity from './src/Entity'

// 检测当前设备是否为移动设备
const isMobile = window.innerWidth <= 768

// 创建一个新的字体加载器
const loader = new FontLoader()

// 用于存储加载的字体
let font

// 加载字体，加载完成后将字体赋值给font变量，并调用printScore函数
loader.load(fontSrc, function (loadedFont) {
  font = loadedFont
  printScore()
})

/**
 * Debug
 */
// 创建一个GUI对象，用于调试（当前被注释掉）
// let gui = null
let gui = new dat.GUI()

// 定义颜色方案，包含地面颜色和雾色
const palettes = {
  green: {
    groundColor: 0x56f854, //#ff7438
    fogColor: 0x39c09f, //#d68a4c
    rockColor: 0xebebeb, //0x7a95ff,
    treeColor: 0x639541, //0x1d5846,
    candyColor: 0x1d5846, //0x614bdd,
    snakeColor: 0x1d5846, //0xff470a,
    mouthColor: 0x39c09f,
  },
  orange: {
    groundColor: 0xd68a4c,
    fogColor: 0xffac38,
    rockColor: 0xacacac,
    treeColor: 0xa2d109,
    candyColor: 0x614bdd,
    snakeColor: 0xff470a,
    mouthColor: 0x614bdd,
  },
  lilac: {
    groundColor: 0xd199ff,
    fogColor: 0xb04ce6,
    rockColor: 0xebebeb,
    treeColor: 0x53d0c1,
    candyColor: 0x9900ff,
    snakeColor: 0xff2ed2,
    mouthColor: 0x614bdd,
  },
}

// 从本地存储中获取颜色方案名称，如果没有则默认为'green'
let paletteName = localStorage.getItem('paletteName') || 'green'

// 根据颜色方案名称从颜色方案对象中获取选中的颜色方案
let selectedPalette = palettes[paletteName]

// 创建一个新的参数对象，包含选中的颜色方案
const params = {
  ...selectedPalette,
}

// 定义一个函数，用于应用颜色方案
function applyPalette(paletteName) {

  // 从颜色方案对象中获取指定的颜色方案
  const palette = palettes[paletteName]

  // 将颜色方案名称存储到本地存储中
  localStorage.setItem('paletteName', paletteName)

  // 更新选中的颜色方案
  selectedPalette = palette

  // 如果颜色方案不存在，则直接返回
  if (!palette) return

  // 从颜色方案中解构出各个颜色
  const {
    groundColor,
    fogColor,
    rockColor,
    treeColor,
    candyColor,
    snakeColor,
    mouthColor,
  } = palette

  // 设置地面材质的颜色
  planeMaterial.color.set(groundColor)

  // 设置场景雾的颜色
  scene.fog.color.set(fogColor)

  // 设置场景背景的颜色
  scene.background.set(fogColor)

  // 遍历场景中的所有实体，找到一个Rock实例，并设置其材质的颜色
  entities
    .find((entity) => entity instanceof Rock)
    ?.mesh.material.color.set(rockColor)

  // 遍历场景中的所有实体，找到一个Tree实例，并设置其材质的颜色
  entities
    .find((entity) => entity instanceof Tree)
    ?.mesh.material.color.set(treeColor)

  // 设置第一个糖果实例的颜色
  candies[0].mesh.material.color.set(candyColor)

  // 设置蛇头的颜色
  snake.body.head.data.mesh.material.color.set(snakeColor)
  // snake.body.head.data.mesh.material.color.set(snakeColor)

  // 设置蛇嘴的颜色
  snake.mouthColor = mouthColor
  snake.mouth.material.color.set(mouthColor)

  // 根据颜色方案名称设置播放按钮的图片源
  btnPlayImg.src = `/btn-play-bg-${paletteName}.png`
}

// 如果存在GUI对象
if (gui) {

  gui
    // 在GUI中添加一个颜色选择器，用于改变'groundColor'参数
    .addColor(params, 'groundColor')
    // 为这个颜色选择器命名为'Ground color'
    .name('Ground color')
    // 当颜色选择器的值改变时，更新平面材质的颜色
    .onChange((val) => planeMaterial.color.set(val))

  gui
    // 在GUI中添加一个颜色选择器，用于改变'fogColor'参数
    .addColor(params, 'fogColor')
    // 为这个颜色选择器命名为'Fog color'
    .name('Fog color')
    .onChange((val) => {
      // 当颜色选择器的值改变时，更新场景雾的颜色
      scene.fog.color.set(val)
      // 同时更新场景背景的颜色
      scene.background.color.set(val)
    })

  gui
    // 在GUI中添加一个颜色选择器，用于改变'rockColor'参数
    .addColor(params, 'rockColor')
    // 为这个颜色选择器命名为'Rock color'
    .name('Rock color')
    .onChange((val) => {
      entities
        // 在所有实体中找到Rock实例
        .find((entity) => entity instanceof Rock)
        // 如果找到，更新Rock的颜色
        ?.mesh.material.color.set(val)
    })

  gui
    // 在GUI中添加一个颜色选择器，用于改变'treeColor'参数
    .addColor(params, 'treeColor')
    // 为这个颜色选择器命名为'Tree color'
    .name('Tree color')
    .onChange((val) => {
      entities
        // 在所有实体中找到Tree实例
        .find((entity) => entity instanceof Tree)
        // 如果找到，更新Tree的颜色
        ?.mesh.material.color.set(val)
    })

  gui
    // 在GUI中添加一个颜色选择器，用于改变'candyColor'参数
    .addColor(params, 'candyColor')
    // 为这个颜色选择器命名为'Candy color'
    .name('Candy color')
    .onChange((val) => {
      // 当颜色选择器的值改变时，更新candies数组中第一个元素的颜色
      candies[0].mesh.material.color.set(val)
    })

  gui
    // 在GUI中添加一个颜色选择器，用于改变'snakeColor'参数
    .addColor(params, 'snakeColor')
    // 为这个颜色选择器命名为'Snake color'
    .name('Snake color')
    .onChange((val) => {
      // 当颜色选择器的值改变时，更新蛇头的颜色
      snake.body.head.data.mesh.material.color.set(val)
    })
}

// 定义一个变量'score'，并初始化为0
let score = 0

// const resolution = new THREE.Vector2(20, 20)
// 创建一个新的GridHelper对象，用于绘制网格
const gridHelper = new THREE.GridHelper(
  // x轴上的网格划分数量
  resolution.x,
  // y轴上的网格划分数量
  resolution.y,
  // 网格线的颜色
  0xffffff,
  // 网格交叉点的颜色
  0xffffff
)
// 设置GridHelper的位置
gridHelper.position.set(resolution.x / 2 - 0.5, -0.49, resolution.y / 2 - 0.5)
// 设置GridHelper的材质为透明
gridHelper.material.transparent = true
// 设置GridHelper的透明度，如果是移动设备则为0.75，否则为0.3
gridHelper.material.opacity = isMobile ? 0.75 : 0.3
/**
 * Scene
 */
// 创建一个新的场景
const scene = new THREE.Scene()
// 设置场景的背景颜色
scene.background = new THREE.Color(params.fogColor)
// 设置场景的雾效果
scene.fog = new THREE.Fog(params.fogColor, 5, 40)
// 将GridHelper添加到场景中
scene.add(gridHelper)

/**
 * Cube
 */
// const material = new THREE.MeshNormalMaterial()
// const geometry = new THREE.BoxGeometry(1, 1, 1)

// const mesh = new THREE.Mesh(geometry, material)
// scene.add(mesh)

/**
 * render sizes
 */
const sizes = {
  // 设置宽度为窗口的内部宽度
  width: window.innerWidth,
  // 设置高度为窗口的内部高度
  height: window.innerHeight,
}
/**
 * Camera
 */
// 创建一个透视相机
// 设置视野角度为60
const fov = 60
// 创建相机，参数分别为视野角度、宽高比和近裁剪面
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1)

// 根据是否是移动设备来设置相机的最终位置
const finalPosition = isMobile
  ? new THREE.Vector3(resolution.x / 2 - 0.5, resolution.x + 15, resolution.y)
  : new THREE.Vector3(
    -8 + resolution.x / 2,
    resolution.x / 2 + 4,
    resolution.y + 6
  )
// 设置相机的初始位置
const initialPosition = new THREE.Vector3(
  resolution.x / 2 + 5,
  4,
  resolution.y / 2 + 4
)

// 将相机的位置设置为初始位置
camera.position.copy(initialPosition)
// camera.lookAt(new THREE.Vector3(0, 2.5, 0))

/**
 * Show the axes of coordinates system
 */

// 创建一个坐标轴辅助对象
const axesHelper = new THREE.AxesHelper(3)
// 将坐标轴辅助对象添加到场景中（当前这行代码被注释掉了）
// scene.add(axesHelper)

/**
 * renderer
 */
// 创建一个WebGL渲染器
const renderer = new THREE.WebGLRenderer({
  // antialias 属性设置为 true 时，会开启抗锯齿，但会稍微降低性能
  // 这里判断设备像素比是否小于 2，如果是，则开启抗锯齿
  antialias: window.devicePixelRatio < 2,
  // logarithmicDepthBuffer 属性设置为 true 时，会使用对数深度缓冲，可以提高深度缓冲的精度
  // 这对于渲染大范围和高精度的场景很有用
  logarithmicDepthBuffer: true,
})
// 将渲染器的DOM元素添加到文档的body中
document.body.appendChild(renderer.domElement)

// 调用handleResize函数
handleResize()

// 设置渲染器的色调映射方式为ACESFilmicToneMapping
renderer.toneMapping = THREE.ACESFilmicToneMapping
// 设置渲染器的色调映射曝光度为1.2
renderer.toneMappingExposure = 1.2
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.VSMShadowMap

/**
 * OrbitControls
 */
// 创建一个OrbitControls对象，用于控制相机的旋转、缩放和平移
const controls = new OrbitControls(camera, renderer.domElement)
// 开启阻尼效果，使得相机的旋转和平移更加平滑
controls.enableDamping = true
// 禁用缩放功能
controls.enableZoom = true
// 禁用平移功能
controls.enablePan = true
// 禁用旋转功能
controls.enableRotate = true
// controls.enableRotate = true
// 设置控制目标的位置，相机将围绕这个位置旋转
controls.target.set(
  resolution.x / 2 - 2,
  0,
  resolution.y / 2 + (isMobile ? 0 : 2)
)

/**
 * Three js Clock
 */
// 创建一个Clock对象，用于获取时间（当前这行代码被注释掉了）
// const clock = new THREE.Clock()

/**
 * Grid
 */

// 创建一个平面几何体，大小为resolution.x * 50, resolution.y * 50
const planeGeometry = new THREE.PlaneGeometry(
  resolution.x * 50,
  resolution.y * 50
)
// 将几何体绕x轴旋转90度
planeGeometry.rotateX(-Math.PI * 0.5)

// 创建一个标准网格材质，颜色为params.groundColor
const planeMaterial = new THREE.MeshStandardMaterial({
  color: params.groundColor,
})

// 使用几何体和材质创建一个网格对象
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
// 设置网格对象的x位置
plane.position.x = resolution.x / 2 - 0.5
// 设置网格对象的z位置
plane.position.z = resolution.y / 2 - 0.5
// 设置网格对象的y位置
plane.position.y = -0.5
// 将网格对象添加到场景中
scene.add(plane)

// 设置网格对象可以接收阴影
plane.receiveShadow = true

// create snake
// 创建蛇对象
const snake = new Snake({
  scene,
  resolution,
  color: selectedPalette.snakeColor,
  mouthColor: selectedPalette.mouthColor,
})
// console.log(snake)

snake.addEventListener('updated', function () {
  // 检查蛇是否与自身或其他实体发生碰撞
  if (snake.checkSelfCollision() || snake.checkEntitiesCollision(entities)) {
    // 如果发生碰撞，蛇死亡
    snake.die()
    // 重置游戏
    resetGame()
  }

  // 检查蛇是否吃到糖果
  // 获取蛇头的索引
  const headIndex = snake.indexes.at(-1)
  // 查找与蛇头索引相同的糖果索引
  const candyIndex = candies.findIndex(
    (candy) => candy.getIndexByCoord() === headIndex
  )
  // 如果找到了糖果
  if (candyIndex >= 0) {
    // 获取该糖果
    const candy = candies[candyIndex]
    // 从场景中移除该糖果
    scene.remove(candy.mesh)
    // 从糖果数组中移除该糖果
    candies.splice(candyIndex, 1)
    // 将该糖果赋值给蛇头
    snake.body.head.data.candy = candy
    // 添加新的糖果
    addCandy()
    // 增加分数
    score += candy.points
    // 打印分数
    printScore()
  }
})

// 定义一个分数实体变量
let scoreEntity

function printScore() {
  // 如果没有字体，直接返回
  if (!font) {
    return
  }

  // 如果分数为0，执行以下代码
  if (!score) {
    score = 0
  }

  // 如果分数实体存在
  if (scoreEntity) {
    // 如果分数实体存在，从场景中移除分数实体
    scene.remove(scoreEntity.mesh)
    // 释放分数实体的几何体内存
    scoreEntity.mesh.geometry.dispose()
    // 释放分数实体的材质内存
    scoreEntity.mesh.material.dispose()
  }

  // 创建一个新的文本几何体，用于显示分数
  const geometry = new TextGeometry(`${score}`, {
    // 使用预先加载的字体
    font: font,
    // 文本大小
    size: 3,
    // 文本深度
    height: 1,
    // 曲线段数
    curveSegments: 12,
    // 启用斜角
    bevelEnabled: true,
    // 斜角厚度
    bevelThickness: 0.1,
    // 斜角大小
    bevelSize: 0.1,
    // 斜角偏移
    bevelOffset: 0,
    // 斜角段数
    bevelSegments: 5,
  })

  // 将几何体的原点设置为其几何中心
  geometry.center()
  if (isMobile) {
    // 如果是移动设备，将几何体绕x轴旋转90度
    geometry.rotateX(-Math.PI * 0.5)
  }

  // 创建一个新的网格对象，用于显示分数
  const mesh = new THREE.Mesh(geometry, snake.body.head.data.mesh.material)

  // 设置网格对象的x位置
  mesh.position.x = resolution.x / 2 - 0.5
  // 设置网格对象的y位置
  mesh.position.y = 1.8
  // 设置网格对象的z位置
  mesh.position.z = -4

  // 设置网格对象可以投射阴影
  mesh.castShadow = true

  // 创建一个新的分数实体，用于显示分数
  scoreEntity = new Entity(mesh, resolution, { size: 0.8, number: 0.3 })

  // 调用分数实体的in方法
  scoreEntity.in()

  // 将分数实体的网格对象添加到场景中
  scene.add(scoreEntity.mesh)
}

// window.addEventListener('click', function () {
// 	!isRunning ? startGame() : stopGame()
// 	// console.log(isRunning)
// })

const mobileArrows = document.getElementById('mobile-arrows')

function registerEventListener() {
  // 判断是否为移动设备
  if (isMobile) {
    //mobile
    // 创建一个新的二维向量用于存储上一次触摸的位置
    const prevTouch = new THREE.Vector2()
    // 初始化中间值
    let middle = 1.55
    // 初始化缩放值
    let scale = 1

    // 添加触摸开始事件监听器
    window.addEventListener('touchstart', (event) => {
      // 获取触摸事件的第一个触摸点
      const touch = event.targetTouches[0]

      // 将中间值限制在1.45和1.65之间
      middle = THREE.MathUtils.clamp(middle, 1.45, 1.65)

      // console.log(event)
      let x, y
      // 计算触摸点的x坐标
      x = (2 * touch.clientX) / window.innerWidth - 1
      // 计算触摸点的y坐标
      y = (2 * touch.clientY) / window.innerHeight - middle

      // if (Math.abs(x) < 0.15 && Math.abs(y) < 0.15) {
      // 	return
      // }

      // 如果游戏没有运行
      if (!isRunning) {
        // 开始游戏
        startGame()
      }

      // console.log('click', x, y)

      // 根据触摸点的位置和缩放值来设置蛇的方向
      if (x * scale > y) {
        if (x * scale < -y) {
          // 设置蛇的方向为上
          snake.setDirection('ArrowUp')
          // 设置缩放值为3
          scale = 3
        } else {
          // 设置蛇的方向为右
          snake.setDirection('ArrowRight')
          // 更新中间值
          middle += y
          // 设置缩放值为0.33
          scale = 0.33
        }
      } else {
        if (-x * scale > y) {
          // 设置蛇的方向为左
          snake.setDirection('ArrowLeft')
          // 更新中间值
          middle += y
          // 设置缩放值为0.33
          scale = 0.33
        } else {
          // 设置蛇的方向为下
          snake.setDirection('ArrowDown')
          // 设置缩放值为3
          scale = 3
        }
      }

      // 更新上一次触摸的x坐标
      prevTouch.x = x
      // 更新上一次触摸的y坐标
      prevTouch.y = y
    })
  } else {
    // 如果不是移动设备，添加键盘按下事件监听器
    window.addEventListener('keydown', function (e) {
      // 获取按下的键的代码
      const keyCode = e.code
      // 设置蛇的方向
      snake.setDirection(keyCode)

      // 如果按下的是空格键
      if (keyCode === 'Space') {
        // 如果游戏没有运行则开始游戏，否则停止游戏
        !isRunning ? startGame() : stopGame()
        // 如果游戏没有运行
      } else if (!isRunning) {
        // 开始游戏
        startGame()
      }
    })
  }
}

// 定义一个变量用于存储游戏是否正在运行的状态
let isRunning

// 定义开始游戏的函数
function startGame() {
  // 如果蛇没有在移动
  if (!snake.isMoving) {
    isRunning = setInterval(() => {
      // 设置一个定时器，每240毫秒更新一次蛇的状态
      snake.update()
    }, 240)
  }
}

// 定义停止游戏的函数
function stopGame() {
  // 清除定时器
  clearInterval(isRunning)
  // 将游戏状态设置为未运行
  isRunning = null
}

// 定义重置游戏的函数
function resetGame() {
  // 停止游戏
  stopGame()
  // 将分数重置为0
  score = 0

  // 从糖果数组中取出一个糖果
  let candy = candies.pop()
  while (candy) {
    // 当还有糖果时，从场景中移除糖果
    scene.remove(candy.mesh)
    // 继续从糖果数组中取出一个糖果
    candy = candies.pop()
  }

  // 从实体数组中取出一个实体
  let entity = entities.pop()
  while (entity) {
    // 当还有实体时，从场景中移除实体
    scene.remove(entity.mesh)
    // 继续从实体数组中取出一个实体
    entity = entities.pop()
  }

  // 添加一个新的糖果
  addCandy()

  // 生成新的实体
  generateEntities()
}

// 定义一个数组用于存储糖果
const candies = []
// 定义一个数组用于存储实体
const entities = []

// 定义添加糖果的函数
function addCandy() {
  // 创建一个新的糖果对象
  const candy = new Candy(resolution, selectedPalette.candyColor)
  // 获取一个空闲的索引
  let index = getFreeIndex()
  // 设置糖果的x坐标
  candy.mesh.position.x = index % resolution.x
  // 设置糖果的z坐标
  candy.mesh.position.z = Math.floor(index / resolution.x)
  // 将糖果添加到糖果数组中
  candies.push(candy)
  // 调用糖果的in方法
  candy.in()
  // 将糖果的网格添加到场景中
  scene.add(candy.mesh)
}

// 调用添加糖果的函数
addCandy()

// 定义获取空闲索引的函数
function getFreeIndex() {
  let index
  // 获取所有糖果的索引
  let candyIndexes = candies.map((candy) => candy.getIndexByCoord())
  // 获取所有实体的索引
  let entityIndexes = entities.map((entity) => entity.getIndexByCoord())

  do {
    // 随机生成一个索引
    index = Math.floor(Math.random() * resolution.x * resolution.y)
  } while (
    // 如果蛇的索引包含这个索引
    snake.indexes.includes(index) ||
    // 或者糖果的索引包含这个索引
    candyIndexes.includes(index) ||
    // 或者实体的索引包含这个索引
    entityIndexes.includes(index)
  )
  // 返回这个索引
  return index
}

// 定义添加实体的函数
function addEntity() {
  // 根据随机数的大小决定创建Rock实例还是Tree实例
  const entity =
    Math.random() > 0.5
      ? new Rock(resolution, selectedPalette.rockColor)
      : new Tree(resolution, selectedPalette.treeColor)

  // 获取一个空闲的索引
  let index = getFreeIndex()

  // 根据索引设置实体的位置
  entity.mesh.position.x = index % resolution.x
  entity.mesh.position.z = Math.floor(index / resolution.x)

  // 将实体添加到实体数组中
  entities.push(entity)

  // 将实体的网格添加到场景中
  scene.add(entity.mesh)
}

// 定义生成实体的函数
function generateEntities() {

  // 循环20次，每次添加一个实体
  for (let i = 0; i < 20; i++) {
    addEntity()
  }

  // 对实体数组进行排序，距离场景中心越近的实体越靠前
  entities.sort((a, b) => {

    // 创建一个向量，表示场景的中心位置
    const c = new THREE.Vector3(
      resolution.x / 2 - 0.5,
      0,
      resolution.y / 2 - 0.5
    )

    // 计算实体a和场景中心的距离
    const distanceA = a.position.clone().sub(c).length()

    // 计算实体b和场景中心的距离
    const distanceB = b.position.clone().sub(c).length()

    // 返回距离的差值，用于排序
    return distanceA - distanceB
  })

  // 使用gsap库创建一个动画，使实体从缩放为0渐变到原始大小
  gsap.from(
    entities.map((entity) => entity.mesh.scale),
    {
      x: 0,
      y: 0,
      z: 0,
      duration: 1,
      ease: 'elastic.out(1.5, 0.5)',
      stagger: {
        grid: [20, 20],
        amount: 0.7,
      },
    }
  )
}

generateEntities()

// 将所有的光源添加到场景中
scene.add(...lights)

// 这行代码被注释掉了，原本的功能是为蛇添加尾巴节点
// snake.addTailNode()

// add entities out of the grid
// 定义一个数组，存储树的位置和大小数据
const treeData = [
  new THREE.Vector4(-5, 0, 10, 1),
  new THREE.Vector4(-6, 0, 15, 1.2),
  new THREE.Vector4(-5, 0, 16, 0.8),
  new THREE.Vector4(-10, 0, 4, 1.3),
  new THREE.Vector4(-5, 0, -3, 2),
  new THREE.Vector4(-4, 0, -4, 1.5),
  new THREE.Vector4(-2, 0, -15, 1),
  new THREE.Vector4(5, 0, -20, 1.2),
  new THREE.Vector4(24, 0, -12, 1.2),
  new THREE.Vector4(2, 0, -6, 1.2),
  new THREE.Vector4(3, 0, -7, 1.8),
  new THREE.Vector4(1, 0, -9, 1.0),
  new THREE.Vector4(15, 0, -8, 1.8),
  new THREE.Vector4(17, 0, -9, 1.1),
  new THREE.Vector4(18, 0, -7, 1.3),
  new THREE.Vector4(24, 0, -1, 1.3),
  new THREE.Vector4(26, 0, 0, 1.8),
  new THREE.Vector4(32, 0, 0, 1),
  new THREE.Vector4(28, 0, 6, 1.7),
  new THREE.Vector4(24, 0, 15, 1.1),
  new THREE.Vector4(16, 0, 23, 1.1),
  new THREE.Vector4(12, 0, 24, 0.9),
  new THREE.Vector4(-13, 0, -13, 0.7),
  new THREE.Vector4(35, 0, 10, 0.7),
]

// 创建一个新的树对象
const tree = new Tree(resolution)

// 遍历树的数据数组
treeData.forEach(({ x, y, z, w }) => {
  // 克隆树的网格
  let clone = tree.mesh.clone()
  // 设置克隆出来的网格的位置
  clone.position.set(x, y, z)
  // 设置克隆出来的网格的大小
  clone.scale.setScalar(w)
  // 将克隆出来的网格添加到场景中
  scene.add(clone)
})

// 创建一个新的岩石对象
const rock = new Rock(resolution)

// 获取场景的x和y分辨率
const resX = resolution.x
const rexY = resolution.y

// 定义一个数组，存储岩石的位置和大小数据
const rockData = [
  // 每个元素是一个数组，第一个元素是岩石的位置，第二个元素是岩石的大小和旋转角度
  [new THREE.Vector3(-7, -0.5, 2), new THREE.Vector4(2, 8, 3, 2.8)],
  [new THREE.Vector3(-3, -0.5, -10), new THREE.Vector4(3, 2, 2.5, 1.5)],
  [new THREE.Vector3(-5, -0.5, 3), new THREE.Vector4(1, 1.5, 2, 0.8)],
  [new THREE.Vector3(resX + 5, -0.5, 3), new THREE.Vector4(4, 1, 3, 1)],
  [new THREE.Vector3(resX + 4, -0.5, 2), new THREE.Vector4(2, 2, 1, 1)],
  [new THREE.Vector3(resX + 8, -0.5, 16), new THREE.Vector4(6, 2, 4, 4)],
  [new THREE.Vector3(resX + 6, -0.5, 13), new THREE.Vector4(3, 2, 2.5, 3.2)],
  [new THREE.Vector3(resX + 5, -0.5, -8), new THREE.Vector4(1, 1, 1, 0)],
  [new THREE.Vector3(resX + 6, -0.5, -7), new THREE.Vector4(2, 4, 1.5, 0.5)],
  [new THREE.Vector3(-5, -0.5, 14), new THREE.Vector4(1, 3, 2, 0)],
  [new THREE.Vector3(-4, -0.5, 15), new THREE.Vector4(0.8, 0.6, 0.7, 0)],
  [
    new THREE.Vector3(resX / 2 + 5, -0.5, 25),
    new THREE.Vector4(2.5, 0.8, 4, 2),
  ],
  [
    new THREE.Vector3(resX / 2 + 9, -0.5, 22),
    new THREE.Vector4(1.2, 2, 1.2, 1),
  ],
  [
    new THREE.Vector3(resX / 2 + 8, -0.5, 21.5),
    new THREE.Vector4(0.8, 1, 0.8, 2),
  ],
  // [new THREE.Vector3(0, -0.5, 0), new THREE.Vector4(1, 1, 1, 0)],
]

// 遍历岩石的数据
rockData.forEach(([position, { x, y, z, w }]) => {
  // 创建一个新的岩石对象，并获取其网格
  let clone = new Rock(resolution).mesh
  // 设置克隆出来的网格的位置
  clone.position.copy(position)
  // 设置克隆出来的网格的大小
  clone.scale.set(x, y, z)
  // 设置克隆出来的网格的旋转角度
  clone.rotation.y = w
  // 将克隆出来的网格添加到场景中
  scene.add(clone)
})

// 获取页面中的音频元素
const audio = document.getElementById('audio')
// 获取页面中的音量按钮元素
const btnVolume = document.getElementById('btn-volume')
// 获取页面中的播放按钮元素
const btnPlay = document.getElementById('btn-play')
const btnPlayImg = document.getElementById('btn-play-img')

// 使用gsap库创建一个动画，使播放按钮从透明和缩放为0渐变到可见和原始大小
gsap.fromTo(
  btnPlay,
  { autoAlpha: 0, scale: 0, yPercent: -50, xPercent: -50 },
  {
    duration: 0.8,
    autoAlpha: 1,
    scale: 1,
    yPercent: -50,
    xPercent: -50,
    delay: 0.3,
    ease: `elastic.out(1.2, 0.7)`,
  }
)

// 为播放按钮添加点击事件监听器
btnPlay.addEventListener('click', function () {

  // 点击播放按钮时，播放音频
  audio.play()

  // 使用gsap库创建一个动画，使摄像机的位置渐变到最终位置
  gsap.to(camera.position, { ...finalPosition, duration: 2 })

  // 如果是移动设备
  if (isMobile) {

    // 使用gsap库创建一个动画，使控制目标的位置渐变到场景的中心
    gsap.to(controls.target, {
      x: resolution.x / 2 - 0.5,
      y: 0,
      z: resolution.y / 2 - 0.5,
    })

    // gsap.to(mobileArrows, { autoAlpha: 0.3, duration: 1, delay: 0.5 })
  }

  // 使用gsap库创建一个动画，使场景的雾的近处和远处的距离渐变
  gsap.to(scene.fog, { duration: 2, near: isMobile ? 30 : 20, far: 55 })

  // 使用gsap库创建一个动画，使播放按钮的大小渐变到0，并在动画完成后隐藏播放按钮
  gsap.to(this, {
    duration: 1,
    scale: 0,
    ease: `elastic.in(1.2, 0.7)`,
    onComplete: () => {
      this.style.visibility = 'hidden'
    },
  })

  // 注册事件监听器
  registerEventListener()
})

// 从localStorage中获取用户的音量设置
const userVolume = localStorage.getItem('volume')

// 检查用户的音量设置，如果设置为关闭，则静音
if (userVolume === 'off') {
  muteVolume()
}

// 获取音频的初始音量
const initialVolume = audio.volume

// 为音量按钮添加点击事件监听
btnVolume.addEventListener('click', function () {

  // 如果音频当前是静音的，那么取消静音，否则静音
  if (audio.volume === 0) {
    unmuteVolume()
  } else {
    muteVolume()
  }
})

// 定义静音函数
function muteVolume() {
  // 将音量设置保存到localStorage
  localStorage.setItem('volume', 'off')
  // 使用gsap库创建一个动画，使音频的音量渐变到0
  gsap.to(audio, { volume: 0, duration: 1 })
  // 修改音量按钮的样式，显示静音状态
  btnVolume.classList.remove('after:hidden')
  btnVolume.querySelector(':first-child').classList.remove('animate-ping')
  btnVolume.classList.add('after:block')
}

// 定义取消静音函数
function unmuteVolume() {
  // 将音量设置保存到localStorage
  localStorage.setItem('volume', 'on')
  // 修改音量按钮的样式，显示有声状态
  btnVolume.classList.add('after:hidden')
  btnVolume.querySelector(':first-child').classList.add('animate-ping')
  btnVolume.classList.remove('after:block')
  // 使用gsap库创建一个动画，使音频的音量渐变到初始音量
  gsap.to(audio, { volume: initialVolume, duration: 1 })
}

// 获取页面中的顶部栏元素
const topBar = document.querySelector('.top-bar')
// 获取页面中的顶部栏项目元素
const topBarItems = document.querySelectorAll('.top-bar__item')
// 使用gsap库设置顶部栏项目的初始位置和透明度
gsap.set(topBarItems, { y: -200, autoAlpha: 0 })
// 使用gsap库创建一个动画，使顶部栏渐变到可见，并在动画完成后使顶部栏项目渐变到原始位置和可见
gsap.to(topBar, {
  opacity: 1,
  delay: 0.3,
  onComplete: () => {
    gsap.to(topBarItems, {
      duration: 1,
      y: 0,
      autoAlpha: 1,
      ease: `elastic.out(1.2, 0.9)`,
      stagger: {
        amount: 0.3,
      },
    })
  },
})
// 获取页面中的所有颜色选择器元素
const paletteSelectors = document.querySelectorAll('[data-color]')
// 使用gsap库创建一个动画，使顶部栏渐变到可见，并在动画完成后使颜色选择器渐变到原始位置和可见
gsap.to(topBar, {
  opacity: 1,
  delay: 0.5,
  onComplete: () => {
    gsap.to(paletteSelectors, {
      duration: 1,
      x: 0,
      autoAlpha: 1,
      ease: `elastic.out(1.2, 0.9)`,
      stagger: {
        amount: 0.2,
      },
    })
  },
})

// 为每个颜色选择器添加点击事件监听，点击时应用对应的颜色调色板
paletteSelectors.forEach((selector) =>
  selector.addEventListener('click', function () {
    const paletteName = this.dataset.color
    applyPalette(paletteName)
  })
)

// 创建一个新的THREE.js加载管理器
const manager = new THREE.LoadingManager()

// 创建一个新的THREE.js纹理加载器，使用加载管理器
const textureLoader = new THREE.TextureLoader(manager)

// 使用纹理加载器加载两个图片资源
const wasd = textureLoader.load('/wasd.png')
const arrows = textureLoader.load('/arrows.png')

// 创建一个新的THREE.js平面几何体，用于显示图片
const wasdGeometry = new THREE.PlaneGeometry(3.5, 2)
// 将几何体旋转90度，使其平面与x轴平行
wasdGeometry.rotateX(-Math.PI * 0.5)

// 创建两个新的THREE.js网格，分别用于显示两个图片
const planeWasd = new THREE.Mesh(
  wasdGeometry,
  new THREE.MeshStandardMaterial({
    transparent: true,
    map: wasd,
    opacity: isMobile ? 0 : 0.5,
  })
)

const planeArrows = new THREE.Mesh(
  wasdGeometry,
  new THREE.MeshStandardMaterial({
    transparent: true,
    map: arrows,
    opacity: isMobile ? 0 : 0.5,
  })
)

// 设置两个网格的位置
planeArrows.position.set(8.7, 0, 21)
planeWasd.position.set(13, 0, 21)

// 将两个网格添加到场景中
scene.add(planeArrows, planeWasd)

// 当所有纹理加载完成时，执行的回调函数
manager.onLoad = () => {
  // console.log('texture caricate')
}

// 应用指定的颜色调色板
applyPalette(paletteName)

// 定义一个函数，用于在每一帧中执行的操作
function tic() {
  // 更新控制器
  controls.update()
  // 渲染场景
  renderer.render(scene, camera)
  // 请求下一帧
  requestAnimationFrame(tic)
}
// 请求第一帧
requestAnimationFrame(tic)
// 为窗口的resize事件添加事件监听器
window.addEventListener('resize', handleResize)

// 定义处理窗口大小改变的函数
function handleResize() {
  // 更新存储窗口大小的变量
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // 更新相机的纵横比
  camera.aspect = sizes.width / sizes.height

  // 更新相机的投影矩阵
  camera.updateProjectionMatrix()

  // 更新渲染器的大小
  renderer.setSize(sizes.width, sizes.height)

  // 获取设备像素比，最大为2
  const pixelRatio = Math.min(window.devicePixelRatio, 2)

  // 设置渲染器的像素比
  renderer.setPixelRatio(pixelRatio)
}
