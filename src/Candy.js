// 导入所需的Three.js模块
import {
	Mesh,
	MeshNormalMaterial,
	MeshStandardMaterial,
	SphereGeometry,
} from 'three'

// 导入Entity类
import Entity from './Entity'

// 创建一个球体几何体，半径为0.3，水平和垂直分段数都为20
const GEOMETRY = new SphereGeometry(0.3, 20, 20)

// 创建一个标准材质，颜色为0x614bdd
const MATERIAL = new MeshStandardMaterial({
	color: 0x614bdd,
})

// 导出Candy类，继承自Entity类
export default class Candy extends Entity {
	constructor(resolution, color) {
    // 创建一个网格，使用上面定义的几何体和材质
		const mesh = new Mesh(GEOMETRY, MATERIAL)

    // 调用父类的构造函数，传入网格和分辨率
		super(mesh, resolution)

    // 如果传入了颜色，那么设置材质的颜色
		if (color) {
			MATERIAL.color.set(color)
		}

    // 随机生成1到3的分数
		this.points = Math.floor(Math.random() * 3) + 1

    // 根据分数设置网格的缩放
		this.mesh.scale.setScalar(0.5 + (this.points * 0.5) / 3)
	}
}
