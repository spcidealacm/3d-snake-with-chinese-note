// 从 'three' 库中导入所需的类和函数
import {
  IcosahedronGeometry,
  Mesh,
  MeshNormalMaterial,
  MeshStandardMaterial,
} from 'three'

// 从本地文件 'Entity.js' 中导入 Entity 类
import Entity from './Entity'

// 创建一个新的 IcosahedronGeometry 实例，半径为 0.3
const GEOMETRY = new IcosahedronGeometry(0.3)

// 随机旋转几何体的 X 轴
GEOMETRY.rotateX(Math.random() * Math.PI * 2)

// 沿 Y 轴缩放几何体，缩放因子为 6
GEOMETRY.scale(1, 6, 1)

// 创建一个新的 MeshStandardMaterial 实例，使用平面着色和绿色
const MATERIAL = new MeshStandardMaterial({
  flatShading: true,
  color: 0xa2d109,
})

// 定义一个名为 'Tree' 的类，该类继承自 'Entity' 类
export default class Tree extends Entity {
  constructor(resolution, color) {
    // 使用定义的几何体和材质创建一个新的 Mesh 实例
    const mesh = new Mesh(GEOMETRY, MATERIAL)

    // 随机缩放网格，范围在 0.6 到 1.2 之间
    mesh.scale.setScalar(0.6 + Math.random() * 0.6)

    // 随机旋转网格的 Y 轴
    mesh.rotation.y = Math.random() * Math.PI * 2

    // 如果提供了颜色，将材质的颜色设置为提供的颜色
    if (color) {
      MATERIAL.color.set(color)
    }

    // 使用创建的网格和提供的分辨率调用超类 'Entity' 的构造函数
    super(mesh, resolution)
  }
}