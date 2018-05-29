import './index.css'
import { util } from './util.js'

/*
 *  参考： https://github.com/bgrins/nativesortable/blob/master/nativesortable.js
 */

/** 当前拖拽元素 */
let dragging = null

export class Drag {
  constructor (el, options) {
    if (!el) {
      throw new Error('lack of el params')
    }

    if (el instanceof HTMLElement) {
      this.els = [el]
    }

    if (typeof el === 'string') {
      this.els = document.querySelectorAll(el)
    }

    /** NodeList 和 HTMLCollection 的区别： https://www.cnblogs.com/xiaohuochai/p/5827389.html */
    if (el instanceof NodeList || el instanceof HTMLCollection) {
      this.els = Array.prototype.slice.call(el)
    }

    this.options = Object.assign({}, Drag.DEFAULTS, options)

    el && this._init()
  }

  // 初始化
  _init () {
    this._bindEvent()
  }

  // 绑定事件
  _bindEvent () {
    this.els.forEach(el => {

      el.addEventListener('dragstart', (e) => {
        this._handleDragStart(e)
      }, false)

      el.addEventListener('dragend', (e) => {
        this._handleDragEnd(e)
      }, false)

      el.addEventListener('dragenter', this._delegate(this._handleDragEnter, el), false)

      el.addEventListener('dragover', (e) => {
        this._handleDragOver(e)
      }, false)

      el.addEventListener('dragleave', this._delegate(this._handleDragLeave, el), false)

      // el.addEventListener('drop', (e) => {
      //   this._handleDrop(e)
      // }, false)

      el.addEventListener('drop', this._delegate(this._handleDrop, el), false)

      Array.from(el.children).forEach(child => child.draggable = true)
      el.setAttribute('data-drag-parent', true)
    })
  }

  _handleDragStart (e, el) {
    // li子元素不会触发
    const { DRAGGINGCLS, CHILDCLS } = this.options

    e.dataTransfer.effectAllowed = 'move'
    dragging = e.target
    util.addClass(dragging, DRAGGINGCLS)

    if (e.target.parentNode && e.target.parentNode.children) {
      Array.from(e.target.parentNode.children).forEach(child => {
        util.addClass(child, CHILDCLS)
      })
    }
  }

  // 鼠标松开,清除样式
  _handleDragEnd (e) {
    let self = this
    // li子元素不会触发
    const { change, DRAGGINGCLS, OVERCLS, CHILDCLS } = this.options
    change() && change(e.target, dragging)

    dragging = null

    if (e.target.parentNode && e.target.parentNode.children) {
      Array.from(e.target.parentNode.children).forEach(child => {
        util.removeClass(child, DRAGGINGCLS)
        util.removeClass(child, OVERCLS)
        util.removeClass(child, CHILDCLS)
        self._dragenterData(child, false)
      })
    }
  }

   // 移入某元素时，将draging元素位置调整到它后面
  _handleDragEnter (e) {
    let target = e.target
    if (dragging === target || !dragging) return

    const { isOnlyPositionChange, OVERCLS } = this.options

    let previousCounter = this._dragenterData(target) // 一开始返回0
    this._dragenterData(target, previousCounter + 1) // 设置为1

    /** 关键代码一 */
    if (previousCounter === 0) {
      util.addClass(target, OVERCLS)
      !isOnlyPositionChange && this._moveElementNextTo(dragging, target)
    }
  }

  _handleDragOver (e) {
    e.dataTransfer.dropEffect = 'move'
    e.preventDefault()
    // 自身划过自身
    if (e.target === dragging) return
    const { OVERCLS } = this.options
  }

  _handleDragLeave (e) {
    e.preventDefault()
    // li子元素会触发
    let target = e.target
    const { OVERCLS } = this.options

    /** 关键代码二 */
    // Prevent dragenter on a child from allowing a dragleave on the container
    let previousCounter = this._dragenterData(target)
    this._dragenterData(target, previousCounter - 1)

    // This is a fix for child elements firing dragenter before the parent fires dragleave
    if (!this._dragenterData(target)) {
        util.removeClass(target, OVERCLS)
        this._dragenterData(target, false)
    }
  }

  _handleDrop (e) {
    e.dropEffect
    let target = e.target
    if (target.getAttribute('data-drag-parent') === 'true') return
    if (target === dragging) return
    if (this.options.isOnlyPositionChange) {
      // 相同父元素的两个子元素交互位置
      // let curSibling = target.nextElementSibling
      // target.parentNode.insertBefore(target, dragging)
      // target.parentNode.insertBefore(dragging, curSibling)
      util.swapElements(dragging, target)
    }
  }

  // 由于孙元素会触发dragenter, dragover,dragleave,drop事件
  // 所有需要找到element的第一代孩子
  _delegate(fn, parentEle) {
    let self = this
    const { CHILDCLS } = self.options
    return function (e) {
      let target = e.target
      if (util.hasClass(target, CHILDCLS)) {
        fn.apply(self, [e])
      } else if (target.parentNode !== parentEle) {
        const context = self._moveUpChildNode(parentEle, target)
        if (context) {
          Object.defineProperty(e, 'target', {
            configurable: true,
            writable: true
          })
          e.target = context
          fn.apply(self, [e])
        }
      }
    }
  }

  _dragenterData (el, val) {
    if (arguments.length === 1) {
      return parseInt(el.getAttribute('data-child-dragenter'), 10) || 0
    } else if (!val) {// 传入0 或者 false
      el.removeAttribute('data-child-dragenter')
    } else {
      el.setAttribute('data-child-dragenter', Math.max(0, val))
    }
  }

  _moveUpChildNode (parent, child) {
    let cur = child
    if (cur === parent) {
      return null
    }
    while (cur) {
      if (cur.parentNode === parent) {
        return cur
      }
      cur = cur.parentNode
      if (!cur || !cur.ownerDocument) {
        break
      }
    }
    return null
  }

  _moveElementNextTo (ele, destination) {
    if (this._isBelow(ele, destination)) {
      destination.parentNode.insertBefore(ele, destination)
    } else {
      destination.parentNode.insertBefore(ele, destination.nextElementSibling)
    }
  }

  _isBelow (el1, el2) {
    if (el1.parentNode !== el2.parentNode) return
    let nextEle = el2.nextElementSibling
    while (nextEle) {
      if (nextEle === el1) {
        return true
      }
      nextEle = nextEle.nextElementSibling
    }
    return false
  }

  // 默认参数
  static get DEFAULTS () {
    return {
      change: new Function (),
      CHILDCLS: 'sortable-child',
      DRAGGINGCLS: 'sortable-dragging',
      OVERCLS: 'sortable-over',
      isOnlyPositionChange: true // 排斥切换 或者 位置切换
    }
  }
}

/**
 * 交互位置有两种方式：
 * 1. 排挤交换：拖拽元素在目标元素上面，直接插到目标元素后面；拖拽元素在目标元素下面，直接插到目标元素前面。
 *            用元素索引来判断，谁前谁后。
 * 2. 位置交换：其他元素不变，拖拽元素和目标元素直接交换位置
 *
 * 排挤交换在ondragenter时交换，位置交换在drop事件发生时才交换
 *
 * 奇怪的问题：
 * <li draggable="true"><div><p>test<p></div>
 *  它的子元素照样会触发ondragenter/over/leave/drop事件(即使他们不设置draggable)，但子元素的draggable是false的
 *
 *
 * html5的drag和drop api真的是奇葩，拖拽本身也可以当成目的地对象触发dragenter,leave,over事件
 * 另外，拖拽元素——>目的地元素, 不是完全进入才触发dragenter, 而大概过一半才触发之后开始触发over;
 * leave也一样，离开的时候过一半就触发leave, 出现了各种种奇奇怪怪的问题。
 * https://cloud.tencent.com/developer/ask/85986
 *
 * 未绑定draggrue=true元素照应能触发drop事件，可以说，任何元素都能触发drop事件，只要有绑定
 */
