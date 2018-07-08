const DEFAULT_INTERVAL = 1000 / 60

const requestAnimationFrame = (function () {
  return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          function (callback) {
            return setTimeout(callback, (callback.interval || DEFAULT_INTERVAL))
          }
})()

const cancelAnimationFrame = (function () {
  return window.cancelAnimationFrame ||
          window.webkitCancelAnimationFrame ||
          window.mozCancelAnimationFrame ||
          window.oCancelAnimationFrame ||
          function (id) {
            window.clearTimeout(id)
          }
})()

// 初始化状态
const STATE_INITIAL = 0
// 开始状态
const STATE_START = 1
// 停止状态
const STATE_STOP = 2

// 时间轴类。用来控制动画
class Timeline {
  constructor () {
    this.state = STATE_INITIAL
    // 定时器id
    this.timerId = null
    // 动画时间间隔
    this.interval = null
    // 动画开始时间
    this.startTime = null
    // 动画从 "开始到现在 已执行"的时间
    this.dur = null
  }

  /**
   * 动画开始
   * @param {*} interval 动画每帧之间的间隔. raf默认是根据浏览器每帧时间去跑的
   * 所以，如果想自定义动画每帧之间的时间间隔，需要另外判断这次回调和上次回调触发的
   * 时间间隔
   */
  start (interval) {
    if (this.state === STATE_START) return
    this.state = STATE_START
    this.interval = interval || DEFAULT_INTERVAL
    // 开始动画
    this._startTimeline(Date.now())
  }

  /**
   * 动画暂停
   */
  stop () {
    if (this.state !== STATE_START) return
    this.state = STATE_STOP
    cancelAnimationFrame(this.timerId)
    // 记录动画从“开始到现在”已执行过的时间
    this.dur = Date.now() - this.startTime
  }

  /**
   * 暂停之后重新开始动画
   */
  restart () {
    if (this.state !== STATE_STOP) return
    if (!this.dur || !this.interval) return
    this.state = STATE_START
    // 重新开始动画
    this._startTimeline(Date.now() - this.dur)
  }

  /**
   * 时间轴上每一次回调执行的函数
   * @param {*} time 动画从开始到现在的执行时间
   */
  onenterframe (time) {}

  /**
   * 开始跑递归
   * @param {*} startTime 动画开始时间
   */
  _startTimeline (startTime) {
    this.startTime = startTime
    const that = this
    nextTick.interval = this.interval
    nextTick()
    /**
     * 每一帧执行的函数
     */
    let lastTick = Date.now()
    function nextTick () {
      let now = Date.now()
      that.timerId = requestAnimationFrame(nextTick)
      // onenterframe和interval由用户传入，每隔
      // interval的时间，触发onenterframe, 给予
      // 用户更加灵活的自定义操作
      if (now - lastTick >= nextTick.interval) {
        // console.log('timeline', now - startTime)
        // this.dur影响这里
        that.onenterframe(now - startTime)
        lastTick = now
      }
    }
  }
}

export default Timeline
