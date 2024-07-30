// 导出一个名为ListNode的类
export default class ListNode {
  // 初始化next和prev属性为null，表示节点的下一个和上一个节点
  next = null
  prev = null

  // 构造函数，接收一个数据作为参数
  constructor(data) {
    // 将传入的数据保存到data属性中
    this.data = data
  }

  // 定义一个方法，用于将当前节点链接到另一个节点
  linkTo(node) {
    // 将传入的节点设置为当前节点的下一个节点
    this.next = node
    // 将当前节点设置为传入节点的上一个节点
    node.prev = this
  }
}