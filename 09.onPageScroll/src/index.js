import './index.css'
import { util } from './util.js'
import listen from './listener'

let WRAPPERCLS = 'onpage-container'
let SECTIONCLS = 'onpage-item'
let ACTIVE = 'active'
let PAGECLS = 'onpage-pagination'

export class OnPageScroll {
  constructor(opts) {
    this.options = Object.assign({}, OnPageScroll.DEFAULTS, opts)

    let wrapper = document.querySelector(this.options.container)
    if (!wrapper) {
      throw new Error('没有onPage容器')
    }

    let sections = wrapper.querySelectorAll(this.options.item)
    if (!sections) {
      throw new Error('没有onPage子容器')
    }

    /** 状态对象 */
    this.data = {
      containerEl: wrapper,
      sectionsEl: Array.from(sections),
      paginationEl: null,
      events: [],
      curPage: 0,
      pageSize: sections.length,
      lastAnimation: 0, // 记录最后一次动画执行时间，避免滚动一次，scroll事件触发太多次
    }

    this._init()
  }

  static get DEFAULTS () {
    return {
      container: 'wrapper',
      item: 'section',
      easing: 'ease',
      animationTime: 1000,
      pagination: true,
      keyboard: true,
      beforeMove: new Function(),
      afterMove: new Function(),
      loop: true,
      quietPeriod: 500, // 安静事件
      // 未使用
      direction: 'vertical', // 滑动方向
      threshold: 50, // 滑动距离阈值
    }
  }

  _init () {
    this._initStyle()
    this.options.pagination && this._renderPagination()
    this._bindEvent()
  }

  /** 事件绑定开始 */
  _bindEvent () {
    this.data.events[this.data.events.length] = listen(this.data.paginationEl, 'click', this._handleClick.bind(this))

    // 滚轮事件：http://www.zhangxinxu.com/wordpress/2013/04/js-mousewheel-dommousescroll-event/
    this.data.events[this.data.events.length] = listen(document, 'mousewheel', this._handleScroll.bind(this))

    this.data.events[this.data.events.length] = listen(document, 'DOMMouseScroll', this._handleScroll.bind(this))

    this.options.keyboard && (
      this.data.events[this.data.events.length] = listen(document, 'keyup', this._handleKey.bind(this))
    )
  }

  _handleClick (e) {
    e.preventDefault()
    let curPage = Number(e.target.dataset.index)
    let prevPage = this.data.curPage
    this.data.curPage = curPage
    this._refreshActiveClass()
    // 跳转
    this._scrollTo(this.data.curPage, prevPage)
  }

  _handleScroll (e) {
    e.preventDefault()
    // 判断滚动方向 delta>0向上滚动
    let delta = e.wheelDelta || -event.detail
    let isScrollDown = Math.sign(delta) === -1
    // 跳转
    this._scroll(isScrollDown)
  }

  _handleKey (e) {
    let tagName = e.target.tagName.toLowerCase()
    switch (e.which) {
      case 38:
        if (tagName != 'input' && tagName != 'textarea') this._scroll(false)
        break
      case 40:
      if (tagName != 'input' && tagName != 'textarea') this._scroll(true)
        break
      default:
        return
    }
  }

  /** dom渲染开始 */
  _renderPagination () {
    let ul = document.createElement('ul')
    ul.classList.add(PAGECLS)

    let liHtml = this.data.sectionsEl.map((child, index) => {
        return `<li><a data-index="${index}" href="#${index}"></a></li>`
      }).join('')
    ul.insertAdjacentHTML('beforeend', liHtml)

    this.data.paginationEl = ul.querySelectorAll('a')
    this.data.paginationEl[0].classList.add('active')
    document.body.appendChild(ul)
  }

  _initStyle () {
    this.data.containerEl.classList.add(WRAPPERCLS)
    this.data.sectionsEl.forEach((child, index) => {
      child.classList.add(SECTIONCLS)
      child.setAttribute('data-index', index)
    })
  }

  /** 具体逻辑开始 */
  _scroll (scrollDown) {
    let prevPage = this.data.curPage
    let nextPage = this._searchNextPage(scrollDown)
    this._scrollTo(nextPage, prevPage)
  }

  _scrollTo (nextPage, prevPage) {
    const { quietPeriod, animationTime } = this.options
    const { lastAnimation } = this.data
    /** 学习这种拦截思想 */
    // 拦截
    let now = new Date().getTime()
    // 当左边大于右边的时候，动画早就执行完了
    if (now - lastAnimation < quietPeriod + animationTime) {
      return
    }
    this.data.lastAnimation = now

    // 更新状态
    this.data.curPage = nextPage
    this._refreshActiveClass()

    this.options.beforeMove && this.options.beforeMove(nextPage, prevPage)

    let pos = -nextPage * 100
    // transform 和 transition同时添加
    let transformCSS =
    '-webkit-transform: translate3d(0, ' +
    pos +
    '%, 0); -webkit-transition: -webkit-transform ' +
    this.options.animationTime +
    'ms ' +
    this.options.easing +
    '; -moz-transform: translate3d(0, ' +
    pos +
    '%, 0); -moz-transition: -moz-transform ' +
    this.options.animationTime +
    'ms ' +
    this.options.easing +
    '; -ms-transform: translate3d(0, ' +
    pos +
    '%, 0); -ms-transition: -ms-transform ' +
    this.options.animationTime +
    'ms ' +
    this.options.easing +
    '; transform: translate3d(0, ' +
    pos +
    '%, 0); transition: transform ' +
    this.options.animationTime +
    'ms ' +
    this.options.easing +
    ';'
  this.data.containerEl.style.cssText = transformCSS

  let transitionEnd = this._whichTransitionEvent()
  let transitionEndEvent = listen(
    this.data.containerEl,
    transitionEnd,
    e => {
      this.options.afterMove && this.options.afterMove(nextPage, prevPage)
      transitionEndEvent.destory()
    }
  )
  }

  _searchNextPage (scrollDown) {
    const { pageSize, curPage } = this.data
    const { loop } = this.options
    let nextPage = curPage
    if (scrollDown) {
      if (loop && curPage === pageSize - 1) {
        nextPage = 0
      } else {
        nextPage += 1
        nextPage = Math.min(nextPage, pageSize - 1)
      }
    } else {
      if (loop && curPage === 0) {
        nextPage = pageSize - 1
      } else {
        nextPage -= 1
        nextPage = Math.max(nextPage, 0)
      }
    }
    return nextPage
  }

  _refreshActiveClass () {
    const { sectionsEl, paginationEl, curPage } = this.data
    sectionsEl.forEach(el => el.classList.remove(ACTIVE))
    paginationEl.forEach(el => el.classList.remove(ACTIVE))
    sectionsEl[curPage].classList.add(ACTIVE)
    paginationEl[curPage].classList.add(ACTIVE)
    document.body.className = document.body.className.replace(/\bviewing-page-\d.*?\b/g, '')
    document.body.classList.add(`viewing-page-${curPage}`)
  }

  _whichTransitionEvent() {
    var t
    var el = document.createElement('fakeelement')
    var transitions = {
      transition: 'transitionend',
      OTransition: 'oTransitionEnd',
      MozTransition: 'transitionend',
      WebkitTransition: 'webkitTransitionEnd'
    }
    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t]
      }
    }
  }
  /** public methods 开始*/
  destory () {
    this.data.events.forEach(item => {
      item.destory()
    })
  }

  // 主动滑动到上一屏
  pre () {
    this._scroll(true)
  }

  // 主动滑动到下一屏
  next () {
    this._scroll(false)
  }

  // 主动滑动到指定界面
  go (page) {
    page = Math.max(0, Math.min(page, this.data.pageSize))
    let prevPage = this.data.curPage
    this._scrollTo(page, prevPage)
  }
}

/**
 * 参考项目
 *
 * pc端实现：
 *  https://github.com/peachananr/purejs-onepage-scroll/blob/master/onepagescroll.js
 *  https://github.com/twinkle77/100plugins/tree/master/20-onePageScroll.js
 *
 * 移动端实现：
 * https://github.com/wechatui/swiper
 *
 * 使用transformCSS 百分比来做位移， 无需监听window.onresize来重新初始化
 */
