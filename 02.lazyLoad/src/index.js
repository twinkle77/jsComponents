import './index.css'
import { util } from './util.js'

export class LazyLoad {
  constructor (opts) {
    this.options = Object.assign({}, LazyLoad.DEFAULTS, opts)
    this._init()
  }

  static get DEFAULTS () {
    return {
      thumbSrc: 'http://img.soogif.com/Z5ZoPFLsIdVTDONqWGo2jPx8cOgDB7rG.gif', // 如果传入thumbSrc,那么所有图片都公用一张缩略图
    }
  }

  _init () {
    this._findUnLoadImgs()
    this._bindEvent()
  }

  _bindEvent () {
    document.addEventListener('scroll', util.throttle1(() => {
      // console.log('scroll')
      this._findUnLoadImgs()
    }, 5000), false)
  }

  _findUnLoadImgs () {
    let unLoadImgs = document.querySelectorAll('[data-src]')
    // 文档高度
    let docHeight = document.documentElement.clientHeight
    /*
      // 滚动条高度
      let scrollTop = document.documentElement.scrollTop
      这里使用getBoundingClientRect, 是只相对于视口而不是文档
      所以无需获得滚动条高度，如果使用offsetTop, 那么久需要获取滚动条高度了
    */
    Array.from(unLoadImgs).forEach(el => {
      let elTop = el.getBoundingClientRect().top
      let elBottom = el.getBoundingClientRect().bottom
      if (elTop <= docHeight) { // 参考https://segmentfault.com/a/1190000010744417
        el.lazyloadSrc = el.dataset.src
        el.removeAttribute('data-src') // 移除src, 防止元素被重新选择到 
        this._loadThumbImg(el)
      }
    })
  }

  _loadThumbImg (el) {
    // 缩略图地址
    let thumbSrc = el.dataset.thumb ? el.dataset.thumb : this.options.thumbSrc
    // 加载缩略图
    const mediumImg = new Image()
    mediumImg.src = thumbSrc
    mediumImg.onload =  () => {
      // 绘制信息
      const drawMes = {
        cutX: 0,
        cutY: 0,
        cutWidth: mediumImg.width,
        cutHeight: mediumImg.height,
        elWidth: el.offsetWidth,
        elHeight: el.offsetHeight
      }
      this._renderCanvas(el, mediumImg, drawMes)
    }
    mediumImg.onerror = function () {
      throw new Error(`缩略图[${mediumImg}]无效！`)
    }
  }

  _renderCanvas (el, drawImg, drawMes) {
    const { cutX, cutY, cutWidth, cutHeight, elWidth, elHeight } = drawMes
    const thumbCavs = document.createElement('canvas')
    thumbCavs.width = elWidth
    thumbCavs.height = elHeight
    el.style.position = 'relative'
    thumbCavs.classList.add('progressive-canvas')
    el.appendChild(thumbCavs)
    const thumbCtx = thumbCavs.getContext('2d')
    thumbCtx.filter = 'blur(' + 5 + 'px)'
    thumbCtx.drawImage(drawImg, cutX, cutY, cutWidth, cutHeight, 0, 0, elWidth, elHeight)
    /**
     *  实例图片的问题：缩略图跟大图大小差不多，效果区别不大，所以这里加了定时器
     */
    setTimeout(() => {
      this._loadRealImg(el, thumbCavs)
    }, 300)
  }

  _loadRealImg (el, thumbCavs) {
    let realSrc = el.lazyloadSrc
    const realImg = new Image()
    realImg.src = realSrc
    realImg.onload = function () {
      thumbCavs.classList.add('progressive-canvas-hidden')
      realImg.classList.add('real-img')
      el.appendChild(realImg)
      el.removeAttribute('data-thumb')
    }
    realImg.onerror = function () {}
  }
}
