// 导入gsap库，用于创建动画
import gsap from 'gsap'

// 导出Entity类
export default class Entity {

  // 构造函数，接收一个网格，一个分辨率，和一个可选的配置对象
  constructor(mesh, resolution, option = { size: 1.5, number: 0.5 }) {

    // 将传入的网格和分辨率保存到实例上
    this.mesh = mesh
    this.resolution = resolution
    // 将传入的配置对象保存到实例上，如果没有传入则使用默认值
    this.option = option

    // 设置网格可以投射和接收阴影
    mesh.castShadow = true
    mesh.receiveShadow = true
  }

  // 定义一个getter，用于获取网格的位置
  get position() {
    return this.mesh.position
  }

  // 定义一个方法，用于根据实例的位置和分辨率获取索引
  getIndexByCoord() {
    const { x, y } = this.resolution
    return this.position.z * x + this.position.x
  }

  // 定义一个方法，用于创建一个动画，使网格从缩放为0渐变到原始大小
  in() {
    gsap.from(this.mesh.scale, {
      duration: 1,
      x: 0,
      y: 0,
      z: 0,
      ease: `elastic.out(${this.option.size}, ${this.option.number})`,
    })
  }

  // 定义一个空的方法，可能在子类中会被覆盖
  out() { }
}
