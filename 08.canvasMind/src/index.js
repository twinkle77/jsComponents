import './index.css'
import { util } from './util.js'
import config from './config.js'
import drawNode from './draw/drawNode'
import drawLine from './draw/drawLine'
import clearCanvas from './draw/clearCanvas'
import drawBtn from './draw/drawBtn'
import calcNode from './draw/calcNode'

export class CanvasMind {
  constructor (el, opts) {
    let canvas = el

    if (typeof el === 'string') {
      canvas = document.getElementById('el')
    }

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error('需要传入canvas的ID，或者直接参数canvas元素')
    }

    this.options = Object.assign({}, CanvasMind.DEFAULTS, opts)

    canvas && this._init(canvas)
  }

  static get DEFAULTS () {
    return {
      data: null
    }
  }

  _init (cavs) {
    this.data = this._setPath(this.options.data)

    this.win = {
      vw: window.innerWidth,
      vh: window.innerHeight
    }
    cavs.width = this.win.vw
    cavs.height = this.win.vh
    this.ctx = cavs.getContext('2d')
    this.center = {
      x: this.win.vw / 2,
      y: this.win.vh / 2
    }
    this.data.isShow = true
    // this._repaint(this.data, Object.assign(this.center, { center: true }))
    this._calcPos(this.data, Object.assign(this.center, { center: true }))
    this._paint(this.data)
    this._bindEvent()
  }

  /** canvas渲染开始 */

  // 一开始用该函数来大概画出图的形状，后面发现问题后，慢慢改造，最后确定了calcPos这个函数
  _repaint (node, pos) {
    node.rect = pos
    let { rectHeight, rectWidth, centerX, centerY } = drawNode(this.ctx, config, node.name, pos)
    // 线的起始点
    let lineStart = {
      x: centerX + rectWidth / 2,
      y: centerY
    }

    if (node.children && node.children.length > 0) {
      // 筛选出要显示的节点
      let showNodes = node.children.filter(item => item.isShow)
      if (showNodes.length !== 0) {
        // 子节点起始X
        let childX = centerX + config.interval + rectWidth / 2
        // 子节点区域总高度
        let { areaHeight, singleHeight } = this._calcChildAreaHeight(showNodes)
        // if (areaHeight === 0) return

        let averageHeight = areaHeight / showNodes.length
        // 子节点起始Y
        let startY = centerY - areaHeight / 2
        showNodes.filter(item => item.isShow).forEach((item, index) => {
          let childY = startY + config.margin + index * averageHeight
          let lineEnd = {
            x: childX,
            y: childY + singleHeight / 2
          }
          drawLine(this.ctx, lineStart, lineEnd)
          this._repaint(item, { x: childX, y: childY })
        })
      }

      // 绘制按钮
      let btnPos = {
        x: centerX + rectWidth / 2,
        y: centerY
      }
      drawBtn(this.ctx, config, node.children.length, btnPos)

      // 存储btn的位置, btnPos的位置也一直在更新
      node.btnPos = btnPos

    }
  }

  // pos为绘制矩形的位置。节点的按钮，连线，其实都由矩形的位置计算得来
  _calcPos (node, pos) {
    let { rectHeight, rectWidth, centerX, centerY } = calcNode(this.ctx, config, node.name, pos)
    // 线的起始点
    let lineStart = {
      x: centerX + rectWidth / 2,
      y: centerY
    }

    node.rect = { width: rectWidth, height: rectHeight, centerX, centerY}
    if (pos.center) node.root = true
    node.line = { start: null, end: [] }
    node.line.start = lineStart

    if (node.children && node.children.length > 0) {
      // 筛选出要显示的节点
      let showNodes = node.children.filter(item => item.isShow)
      if (showNodes.length !== 0) {
        // 子节点起始X
        let childX = centerX + config.interval + rectWidth / 2
        // 子节点区域总高度
        let { areaHeight, singleHeight } = this._calcChildAreaHeight(showNodes)
        let averageHeight = areaHeight / showNodes.length
        // 子节点起始Y
        let startY = centerY - areaHeight / 2
        showNodes.filter(item => item.isShow).forEach((item, index) => {
            let childY = startY + config.margin + index * averageHeight
             /** 关键代码：如果node存在偏移，需要加上 */
            item.moveUp && (childY += item.moveUp)
            item.moveDown && (childY += item.moveDown)
            let lineEnd = {
              x: childX,
              y: childY + singleHeight / 2
            }
            node.line.end.push(lineEnd)

            // drawLine(this.ctx, lineStart, lineEnd)
            this._calcPos(item, { x: childX, y: childY })
          // }

        })
      }

      // 绘制按钮
      let btnPos = {
        x: centerX + rectWidth / 2,
        y: centerY
      }
      // drawBtn(this.ctx, config, node.children.length, btnPos)

      // 存储btn的位置, btnPos的位置也一直在更新
      node.btnPos = btnPos

    }
  }

  // 真正的绘制函数
  _paint (node) {
    const { name, rect, line, btnPos, isShow } = node
    if (!isShow) return

    drawNode(this.ctx, config, name, { x: rect.centerX, y: rect.centerY, center: true })

    line.end.forEach((item, index) => {
      drawLine(this.ctx, line.start, line.end[index])
    })

    btnPos && drawBtn(this.ctx, config, node.children.length, btnPos)

    node.children.forEach(item => {
      this._paint(item)
    })
  }

  /** canvas绘制结束 */

  /** 事件绑定开始 */
  _bindEvent () {
    document.addEventListener('click', this._showNode.bind(this, this.data))
  }

  // 点击事件处理函数
  _showNode(node, e) {
    let pageX = e.clientX
    let pageY = e.clientY

    let clickNode = this._searchClickNode(pageX, pageY)
    if (clickNode) {
      for (let i = 0; i < clickNode.children.length; i++) {
        let child = clickNode.children[i]
        if (!child.isShow) {
          child.isShow = true
          if (i !== 0) {
            clickNode.path && this._moveHigerLevelNode(clickNode)
          }

          this._calcPos(this.data, Object.assign(this.center, { center: true }))
          // 碰撞检测：console.log(this._getCurNodeMaxHeight(clickNode))
          this._clear()
          this._paint(this.data)
          return
        }
      }
    }

  }

  /** 事件绑定结束 */

  /** 计算类方法开始 */

  // 比当前节点高的节点向上移，比当前节点低的节点向下移, 递归直到根节点(移动二分之一node占据的高度)
  _moveHigerLevelNode (curNode) {
    if (!curNode.path) return

    let singleHeight = parseInt(config.font) + 2 * config.padding + 2 * config.margin
    let path = curNode.path.split('-')

    // 当前click节点的父节点
    let parentPath = path.slice(0)
    parentPath.pop()
    let parentNode = this._getCurentNode(parentPath)

    let curIndex = path.pop()
    // 获取比当前节点高的节点
    let topNode = []
    // 获取比当前节点底的节点
    let bottomNode = []
    for (let i = 0; i < parentNode.children.length; i++) {
      let curNode = parentNode.children[i]
      if (i < curIndex) {
        topNode.push(curNode)
      } else if (i > curIndex) {
        bottomNode.push(curNode)
      }
    }
    /** 关键代码：isShow=false的节点也需要移动 */
    topNode.forEach(topItem => {
      if (!topItem.moveUp) {
        topItem.moveUp = 0
      }
      topItem.moveUp -= singleHeight / 2
    })
    bottomNode.forEach(bottomItem => {
      if (!bottomItem.moveDown) {
        bottomItem.moveDown = 0
      }
      bottomItem.moveDown += singleHeight / 2
    })
    this._moveHigerLevelNode(parentNode)
  }

  // 根据mouseX, mouseY，定位用户点击到的按钮, 返回点击到的节点的信息对象
  _searchClickNode (x, y) {
    return (function searchNode(node) {
      let res = null
      if (node.btnPos) {
        if (x >= node.btnPos.x - config.btnStyle.radius && x <= node.btnPos.x + config.btnStyle.radius) {
          if (y >= node.btnPos.y - config.btnStyle.radius && y <= node.btnPos.y + config.btnStyle.radius) {
            return node
          }
        }
      }

      if (node.children && node.children.length > 0) {
        for(let i = 0; i < node.children.length; i++) {
          res = searchNode(node.children[i])
          if (res) return res
        }
      }
      return null
    })(this.data)
  }

  // 计算isShow为true的子节点所占区域总高度
  _calcChildAreaHeight(nodes) {
    const { margin, padding, font } = config
    let singleHeight = parseInt(font) + 2 * padding
    let areaHeight = (2 * margin + singleHeight) * nodes.length
    return {
      areaHeight,
      singleHeight
    }
  }

  // 给每个node设置一个路劲，便于寻找其父node
  _setPath (nodes) {
    nodes.children = (function setPath (nodes, parentPath) {
      return nodes.map((item, index) => {
        let path = parentPath ? `${parentPath}-${index}` : `${index}`
        return Object.assign({}, item, {
          path,
          isShow: false,
          children: item.children && item.children.length ? setPath(item.children, path) : []
        })
      })
    })(nodes.children)
    return nodes
  }

  // 根据路径获取节点信息，主要弄来寻找父node
  _getCurentNode ([...path]) {
    if (path.length === 0) return this.data
    let now = path.shift()
    let node = this.data.children[now]
    while (path.length > 0) {
      now = path.shift()
      node = node.children[now]
    }
    return node
  }

  // 清空画布
  _clear () {
    clearCanvas(this.ctx, this.win.vw, this.win.vh)
  }

  /** 碰撞检测的两个方法，后面发现不用用到 */
  // 计算当前节点（包括子节点，孙子节点占据的最大高度）
  _getCurNodeMaxHeight (node) {
    let self = this;
    let rangeArr =  (function getMaxHeight (node) {
      // if (node.children.length === 0) return
      let range = [self._getCurNodeChildHeightRange(node)]
      // node.children.forEach(child => {
      //   range = range.concat(self._getCurNodeChildHeightRange(child))
      // })
      return range
    })(node)
    return rangeArr.filter(item => item)
  }

  // 计算当前节点的子节点（不包括孙子节点）占据的高度范围
  _getCurNodeChildHeightRange (node) {
    if (!node.children.length) return
    let showNodes = node.children.filter(item => item.isShow)
    if (!showNodes.length) return
    let firstNode = showNodes[0]
    let finalNode = showNodes[showNodes.length - 1]
    let minTop = firstNode.rect.centerY - firstNode.rect.height / 2 - config.margin
    let maxTop = finalNode.rect.centerY + finalNode.rect.height / 2 + config.margin
    return {
      minTop,
      maxTop,
      name: node.name
    }
  }
}


   /**
   *  整个过程围绕该数据结构来操作，难点作为在递归修改该数据结构的过程
   * {
   *  name: '111',
   *  rect: { startX, startY, width, height },
   *  line: { start: {}, end: [] },
   *  btnPos: { x, y }
   *  path: '0-1',
   *  children: [
   *   { name: '222', ... }
   *  ]
   * }
   *
   */
