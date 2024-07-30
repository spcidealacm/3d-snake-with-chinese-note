// 导出一个名为LinkedKList的类
export default class LinkedKList {
    // 构造函数，接收一个节点作为参数
    constructor(head) {
        // 将传入的节点保存为链表的头节点
        this.head = head
        // 将传入的节点保存为链表的尾节点
        this.end = head
    }

    // 定义一个方法，用于向链表中添加节点
    addNode(node) {
        // 调用尾节点的linkTo方法，将新节点链接到尾节点后面
        this.end.linkTo(node)
        // 更新尾节点为新添加的节点
        this.end = node
    }
}