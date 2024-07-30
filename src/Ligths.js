// 定义一个空的方法，可能在子类中会被覆盖
import { AmbientLight, DirectionalLight } from 'three'
// 导入分辨率参数
import { resolution } from './Params'

// 创建一个环境光源，颜色为白色，强度为0.6
const ambLight = new AmbientLight(0xffffff, 0.6)

// 创建一个定向光源，颜色为白色，强度为0.7
const dirLight = new DirectionalLight(0xffffff, 0.7)

// 设置定向光源的位置
dirLight.position.set(20, 20, 18)
// 设置定向光源的目标位置，即光源照射的方向
dirLight.target.position.set(resolution.x / 2, 0, resolution.y / 2)
// 设置定向光源的阴影贴图的大小
dirLight.shadow.mapSize.set(1024, 1024)
// 设置定向光源的阴影半径
dirLight.shadow.radius = 7
// 设置定向光源的阴影模糊采样数
dirLight.shadow.blurSamples = 20
// 设置定向光源的阴影相机的上边界
dirLight.shadow.camera.top = 30
// 设置定向光源的阴影相机的下边界
dirLight.shadow.camera.bottom = -30
// 设置定向光源的阴影相机的左边界
dirLight.shadow.camera.left = -30
// 设置定向光源的阴影相机的右边界
dirLight.shadow.camera.right = 30

// 设置定向光源可以产生阴影
dirLight.castShadow = true

// 创建一个数组，包含了定向光源和环境光源
const lights = [dirLight, ambLight]

// 导出lights数组
export default lights
