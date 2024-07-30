// 导入Three.js库中的Vector2类
import { Vector2 } from 'three'

// 创建一个二维向量，x和y的值都为20，用于表示分辨率
const resolution = new Vector2(20, 20)

// 创建一个对象，包含了地面的颜色和雾的颜色
const colors = {
    // 地面的颜色为'#ff7438'
    groundColor: '#ff7438',
    // 雾的颜色为'#d68a4c'
    fogColor: '#d68a4c',
}

// 导出resolution和colors
export { resolution, colors }
