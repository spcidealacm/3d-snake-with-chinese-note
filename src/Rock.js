// 导入Three.js库中的IcosahedronGeometry（二十面体几何体）、Mesh（网格）、MeshNormalMaterial（网格法向材质）、MeshStandardMaterial（标准材质）类
import {
    IcosahedronGeometry,
    Mesh,
    MeshNormalMaterial,
    MeshStandardMaterial,
} from 'three'
// 导入Entity类
import Entity from './Entity'

// 创建一个二十面体几何体，半径为0.5
const GEOMETRY = new IcosahedronGeometry(0.5)
// 创建一个标准材质，颜色为0xacacac，开启平面着色
const MATERIAL = new MeshStandardMaterial({
    color: 0xacacac,
    flatShading: true,
})

// 导出一个名为Rock的类，继承自Entity类
export default class Rock extends Entity {
    // 构造函数，接收一个分辨率和一个颜色作为参数
    constructor(resolution, color) {
        // 创建一个网格，几何体为GEOMETRY，材质为MATERIAL
        const mesh = new Mesh(GEOMETRY, MATERIAL)
        // 设置网格的缩放，x和z轴的缩放为随机值，y轴的缩放为固定值
        mesh.scale.set(Math.random() * 0.5 + 0.5, 0.5 + Math.random() ** 2 * 1.9, 1)
        // 设置网格的旋转，y轴和x轴的旋转为随机值
        mesh.rotation.y = Math.random() * Math.PI * 2
        mesh.rotation.x = Math.random() * Math.PI * 0.1
        // 设置旋转的顺序为YXZ
        mesh.rotation.order = 'YXZ'
        // 设置网格的位置，y轴的位置为-0.5
        mesh.position.y = -0.5

        // 如果传入了颜色，就将材质的颜色设置为传入的颜色
        if (color) {
            MATERIAL.color.set(color)
        }

        // 调用父类的构造函数，传入网格和分辨率
        super(mesh, resolution)
    }
}