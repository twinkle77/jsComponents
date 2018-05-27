import './index.css'
import { util } from './util.js'

export class Drag {
  constructor (el, options) {
    if (el instanceof HTMLElement) {
      this.els = [el]
    }

    if (typeof el === 'string') {
      this.els = document.querySelectorAll(el)
    }

    this.els = Array.prototype.slice.call(el)

    this.options = Object.assign({}, options, Drag.DEFAULTS)

    el && this._init()
  }

  // 初始化
  _init () {
    this._bindEvent()
  }

  // 绑定事件
  _bindEvent () {
    this.els.forEach(el => {
      el.drag = true

      el.addEventListener('dragstart', function (e) {

      }, false)


    })
  }

  // 默认参数
  static get DEFAULTS () {
    return {
      connectWith: null,
      acceptFrom: null,
      copy: false,
      placeholder: null,
      disableIEFix: null,
      placeholderClass: 'sortable-placeholder',
      draggingClass: 'sortable-dragging',
      hoverClass: false,
      debounce: 0,
      maxItems: 0,
      itemSerializer: undefined,
      containerSerializer: undefined,
      customDragImage: null,
      items: null
    }
  }

  // 摧毁
  destory () {}

  // 生效
  enable () {}

  // 失效
  disable () {}
}
