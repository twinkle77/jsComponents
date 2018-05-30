import './index.css'
import { util } from './util.js'

export class Magnifier {
  constructor (options) {
    if (!options) {
      throw new Error('请传入参数！')
    }

    if (options.el) {
      if (typeof options.el === 'string') {
        options.el = document.querySelectorAll(options.el)
      } else if (options.el instanceof HTMLElement) {
        options.el = [options.el]
      } else if (options.el instanceof HTMLCollection || options.el instanceof Nodelist) {
        options.el = options.el
      }
    } else {
      options.el = document.querySelectorAll('[data-magnifier]')
    }

    if (!options.el) {
      throw new Error('请传入元素节点，或者在页面给元素添加data-magnifier属性！')
    }

    this.options = Object.assign({}, Magnifier.DEFAULTS, options)

    // 如果元素身上没有data-magnifier,则添加它，使得样式生效
    Array.from(this.options.el).forEach(el => {
      if (el.getAttribute('data-magnifier') === null) {
        el.setAttribute('data-magnifier', '')
      }
    })

    // 每个元素节点都由对象来保存它的信息
    this.targetMes = Array.from(this.options.el).map(target => ({
      el: target,

      thumbImg: null,
      bigImg: null,
      tracker: null,
      zoom: null,
      loader: null,

      // img容器的宽高
      width: 0,
      height: 0,
      // 当前鼠标的位置
      left: 0,
      top: 0,

      thumbImgLoaded: false,
      bigImgLoaded: false,

      trackerSize: 0,
      trackerLeft: 0,
      trackerTop: 0
    }))

    this._init()
  }

  static get DEFAULTS () {
    return {
      size: 200,
      // zoom位置可由position也可由pos来决定,两选一
      position: 'right',  // ['top', 'left', 'right', 'bottom']
      pos: null,
      margin: 20,
      showTitle: true,
      trackerSize: null
    }
  }

  _init () {
    this._bindEvent()
  }

  _bindEvent () {
    this.targetMes.forEach((target, index) => {
      let el = target.el
      // mousemove,mouseout都会冒泡，鼠标在tracker上会一直触发，所以需要需要让tracker脱离鼠标
      el.addEventListener('mousemove', this._handleMouseMove.bind(this, index), false)
      el.addEventListener('mouseout', this._handleMouseOut.bind(this, index), false)
    })
  }

  // 鼠标移入
  _handleMouseMove (index, e) {
    let curMes = this.targetMes[index]
    let el = curMes.el

    // 让dom只创建一次
    if (!el.getAttribute('data-magnifier-index')) {
      el.setAttribute('data-magnifier-index', index)
      this._createEquipment(curMes)
    }

    // 如果缩略图还未加载完成，先退出
    if (!curMes.thumbImgLoaded) {
      this._isImgLoad(curMes.thumbImg).then(() => {
        curMes.thumbImgLoaded = true
        // 存储缩略图的容器宽高
        curMes.width = curMes.thumbImg.offsetWidth
        curMes.height = curMes.thumbImg.offsetHeight
      })
      return
    }

    // 获取鼠标相对图片的距离
    let pos = this._getPointer(e, curMes.thumbImg)
    curMes.left = pos.left
    curMes.top = pos.top

    // 如果大图未加载完成，显示loading
    if (curMes.bigImgLoaded) {
      this._handleTracker(curMes)
      this._handleZoom(curMes)
    } else {
      curMes.loader.style.display = 'block'
      this._isImgLoad(curMes.bigImg).then(() => {
        curMes.bigImgLoaded = true
        curMes.loader.style.display = 'none'
        this._handleTracker(curMes)
        this._handleZoom(curMes)
      })
    }
  }

  // 鼠标移出
  _handleMouseOut (index, e) {
    let curMes = this.targetMes[index]
    curMes.tracker.style.display = 'none'
    curMes.zoom.style.display = 'none'
    curMes.tracker.style.top = 0
    curMes.tracker.style.left = 0
  }

  // 跟踪器
  _handleTracker (targetMes) {
    const { width, height, tracker, top, left } = targetMes
    targetMes.trackerSize = this.options.trackerSize ? this.options.trackerSize : Math.min(width, height) / 5
    tracker.style.width = tracker.style.height = `${targetMes.trackerSize}px`
    tracker.style.display = 'block'

    let x = 0
    let y = 0
    /**
     * 关键代码：
     * 子元素一直在冒泡触发mousemove,mouseout事件
     * 必须将tracker脱离鼠标，不然他本身就一直在触发，所以有了下面的代码
     */
    if (left <= targetMes.trackerSize / 2) {
      x = 0
    } else if (left >= width - targetMes.trackerSize / 2 && left <= width) {
      x = width - targetMes.trackerSize
    } else {
      x = left - targetMes.trackerSize / 2
    }

    if (top <= targetMes.trackerSize / 2) {
      y = 0
    } else if (top >= height - targetMes.trackerSize / 2 && top <= height) {
      y = height - targetMes.trackerSize
    } else {
      y = top - targetMes.trackerSize / 2
    }

    tracker.style.left = x + 'px'
    tracker.style.top = y + 'px'
    /** 关键代码 */
    targetMes.trackerLeft = x
    targetMes.trackerTop = y
  }

  // 放大器
  _handleZoom (targetMes) {
    const { el, trackerSize, width, zoom, bigImg, trackerLeft, trackerTop } = targetMes
    const { size, margin, position, pos } = this.options

    zoom.style.display = 'block'

    // 容器大小
    zoom.style.width = zoom.style.height = size + 'px'

    // 容器位置
    let zoomTop = 0
    let zoomLeft = 0
    if (pos) {
      zoomTop = parseInt(pos.top) + 'px'
      zoomLeft = parseInt(pos.left) + 'px'
    } else if (position === 'top') {
      zoomTop = -(margin + size) + 'px'
      zoomLeft = 0
    } else if (position === 'right') {
      zoomTop = 0
      zoomLeft = width + margin + 'px'
    } else if (position === 'bottom') {
      zoomTop = height + margin + 'px'
      zoomLeft = 0
    } else if (position === 'left') {
      zoomTop = 0
      zoomLeft = -(margin + size) + 'px'
    }
    zoom.style.top = zoomTop
    zoom.style.left = zoomLeft

    /** 关键代码 */
    // 图片动画：强制同步放大比率, 例外思路： background实现
    let radio = size / trackerSize
    /** 图片放大=图片宽度*radio */
    bigImg.style.width = width * radio + 'px'
    bigImg.style[this._transformProp()] = `translate3d(-${trackerLeft * radio}px, -${trackerTop * radio}px, 0)`
  }

  // 获取鼠标相对图片的位置
  _getPointer (e, img) {
    let rect = img.getBoundingClientRect()
    return {
      left: e.clientX - rect.left,
      top: e.clientY - rect.top
    }
  }

  // 创建dom
  _createEquipment (targetMes) {
    let el = targetMes.el
    let bigImgSrc = el.getAttribute('href') || el.getAttribute('data-src')

    util.insertHtml(el, 'beforeend', `<div class="magnifier-tracker"></div>`)
    util.insertHtml(el, 'beforeend', `<div class="magnifier-zoom"><img src="${bigImgSrc}" alt="bigImg"/></div>`)
    util.insertHtml(el, 'beforeend', `<div class="magnifier-loader"></div>`)

    targetMes.thumbImg = el.querySelector('img')
    targetMes.tracker = el.querySelector('.magnifier-tracker')
    targetMes.zoom = el.querySelector('.magnifier-zoom')
    targetMes.loader = el.querySelector('.magnifier-loader')
    targetMes.bigImg = targetMes.zoom.querySelector('img')

    if (this.options.showTitle) {
      let title = el.getAttribute('title') || el.getAttribute('data-title') || 'lack of title'
      util.insertHtml(targetMes.zoom, 'beforeend', `<div class="magnifier-title">${title}</div>`)
    }
  }

  // 判断图片是否加载完成
  _isImgLoad (image) {
    const isEffective = (img) => ('naturalHeight' in img && img.naturalHeight + img.naturalWidth !== 0) || img.width + img.height !== 0
    return new Promise ((resolve, reject) => {
      if (image.complete) {
        if (!isEffective(image)) {
          return reject(new Error('图片无效！'))
        }
        return resolve(image)
      }
      image.addEventListener('load', () => {
        if (!isEffective(image)) {
          return reject(new Error('图片无效！'))
        }
        return resolve(image)
      })
      image.addEventListener('error', () => {
        return reject(new Error('图片加载失败！'))
      })
    })
  }

  // 添加transform前缀
  _transformProp () {
    return (function () {
      let testEl = document.createElement('div')
      if (testEl.style.transform === null) {
        const vendors = ['Webkit', 'Moz', 'ms'];
        for (var vendor in vendors) {
          if (testEl.style[vendors[vendor] + 'Transform'] !== undefined) {
            return vendors[vendor] + 'Transform';
          }
        }
      }
      return 'transform'
    })()
  }

  destory () {
    this.targetMes.forEach(target => {
      let el = target.el
      el.removeEventListener('mousemove', this._handleMouseMove, false)
      el.removeEventListener('mouseout', this._handleMouseOut, false)
      el.removeAttribute('data-magnifier-index')

      util.removeElement(target.tracker)
      util.removeElement(target.zoom)
      util.removeElement(target.loader)
      util.removeElement(target.bigImg)

      target.el = null
      target.thumbImg = null
      target.bigImg = null
      target.tracker = null
      target.zoom = null
      target.loader = null
    })
  }
}
