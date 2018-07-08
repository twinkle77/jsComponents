'use strict'

import './index.css'
import loadImage from './loadImage'
import Timeline from './timeline'
import { util } from './util.js'

const DEFAULT_INTERVAL = 1000 / 60

// 同步任务
const TASK_SYNC = 0
// 异步任务
const TASK_ASYNC = 1
// 除了动画其他都算同步任务

/**
 * 组件具有暂停，开始，初始化状态
 */
// 初始化状态
const STATE_INITIAL = 0
// 开始状态
const STATE_START = 1
// 停止状态
const STATE_STOP = 2

export class Animation {
  constructor () {
    this.state = STATE_INITIAL
    // 任务队列
    this.taskQueue = []
    // 当前执行的任务索引
    this.index = 0
    // 时间轴类。用来播放帧动画
    this.timeline = new Timeline()
    // 异步任务的时间间隔
    this.interval = null
  }
  /**
   * 添加一个同步任务
   * 预加载图片
   * @param {*} imglist 图片地址数组
   */
  loadImage (imglist) {
    // 同步任务接受一个next参数，用于函数执行完后切换到下一个任务
    const taskFn = function (next) {
      loadImage(imglist.slice(), next)
    }
    const type = TASK_SYNC
    return this._add(taskFn, type)
  }
  /**
   * 添加一个异步定时任务
   * 通过定时改变元素el的backgroundPosition，实现帧动画
   * @param {*} el
   * @param {*} positions
   * @param {*} imageUrl
   */
  changePosition (el, positions, imageUrl) {
    let len = positions.length
    let taskFn
    let type
    if (len) {
      taskFn = (next, time) => {
        if (imageUrl) {
          el.style.backgroundImage = `url(${imageUrl})`
          el.style.backgroundRepeat = 'no-repeat'
        }
        let index = Math.min(time / this.interval | 0, len)
        let pos = positions[index - 1].split(' ')
        el.style.backgroundPosition = `${pos[0]}px ${pos[1]}px`
        // 当前任务执行完毕
        if (index === len) {
          next()
        }
      }
      type = TASK_ASYNC
    } else {
      taskFn = (next) => { next() }
      type = TASK_SYNC
    }
    return this._add(taskFn, type)
  }
  /**
   * 添加一个异步定时任务
   * 通过定时改变元素的src或backgroundImage，实现帧动画
   * @param {*} el
   * @param {*} imglist
   */
  changeSrc (el, imglist) {
    let len = imglist.length
    let taskFn
    let type
    if (len) {
      taskFn = (next, time) => {
        let index = Math.min(time / this.interval | 0, len)
        el.src = imglist[index - 1]
        console.log(el)
        // 当前任务执行完毕
        if (index === len) {
          next()
        }
      }
      type = TASK_ASYNC
    } else {
      taskFn = (next) => { next() }
      type = TASK_SYNC
    }
    return this._add(taskFn, type)
  }
  /**
   * 添加一个异步定时任务
   * 该任务自定义动画每帧执行的任务函数
   * @param {*} taskFn 每帧执行的任务函数
   */
  enterFrame (taskFn) {
    // taskFn函数里面需要自己手动next
    return this._add(taskFn, TASK_ASYNC)
  }
  /**
   * 添加一个同步任务
   * 可以在上一个任务完成执行后执行该回调函数
   * @param {*} callback
   */
  then (callback) {
    const taskFn = function (next) {
      callback && callback(this)
      next()
    }
    const type = TASK_SYNC
    return this._add(taskFn, type)
  }
  /**
   * 开始执行任务
   * @param {*} interval 异步定时任务执行的时间间隔。只对“异步定时任务”起作用
   */
  start (interval) {
    if (this.state === STATE_START) return
    if (!this.taskQueue.length) return this
    this.state = STATE_START
    this.interval = interval || DEFAULT_INTERVAL
    // 开始跑任务
    this._runTask()
    return this
  }
  /**
   * 添加一个同步任务，该任务就是回退到上一个任务中
   * 实现重复上一个任务的效果，可定义重复的次数
   * @param {*} times 重复执行的次数
   */
  repeat (times) {
    const taskFn = (next) => {
      if (typeof times === 'undefined') {
        this.index--
        this._runTask()
        return
      }
      if (times) {
        times--
        this.index--
        this._runTask()
      } else {
        this._next()
      }
    }
    const type = TASK_SYNC
    return this._add(taskFn, type)
  }
  /**
   * 添加一个同步任务
   * 无限循环上一次任务 = repeat()
   */
  repeatForever () {
    return this.repeat()
  }
  /**
   * 当前任务结束后下一个任务开始前的等待时间
   * @param {*} time 等待时长
   */
  wait (time) {
    // if (!this.taskQueue || this.taskQueue.length <= 0) return
    // this.taskQueue[this.taskQueue.length - 1].wait = time
    const taskFn = (next) => {
      setTimeout(() => {
        next()
      }, time)
    }
    const type = TASK_SYNC
    return this._add(taskFn, type)
  }
  /**
   * 暂停当前执行的异步定时任务
   */
  pause () {
    if (this.state !== STATE_START || !this.timeline) return this
    this.state = STATE_STOP
    this.timeline.stop()
    return this
  }
  /**
   * 重新开始执行之前被停止过异步定时任务
   */
  restart () {
    if (this.state !== STATE_STOP) return this
    this.state = STATE_START
    this.timeline.restart()
    return this
  }
  /**
   * 释放资源
   */
  dispose () {
    if (this.state !== STATE_INITIAL) {
      this.state = STATE_INITIAL
      this.taskQueue = null
      this.timeline.stop()
      this.timeline = null
    }
    return this
  }
  /**
   * 添加一个任务到任务队列中
   * @param {*} taskFn 任务方法
   * @param {*} type 任务类型
   */
  _add (taskFn, type) {
    this.taskQueue.push({
      taskFn,
      type
    })
    return this
  }
  /*** 下面的函数用于执行任务 ***/
  /**
   * 执行任务
   * @private
   */
  _runTask () {
    if (!this.taskQueue || this.state !== STATE_START) return

    // 任务执行完
    if (this.index === this.taskQueue.length) {
      this.dispose()
      return
    }
    // 获得任务链上的任务
    const curTask = this.taskQueue[this.index]

    if (curTask.type === TASK_ASYNC) {
      this._runAsyncTask(curTask)
    } else {
      this._runSyncTask(curTask)
    }
  }
  /**
   * 执行同步任务
   * @param {*} task
   */
  _runAsyncTask (task) {
    const next = () => {
      this.timeline.stop()
      this._next()
    }
    /**
     * 定义每一帧执行的回调函数
     * time: 动画从开始到现在的执行时间
     */
    const onenterframe = (time) => {
      task.taskFn(next, time)
    }
    this.timeline.onenterframe = onenterframe
    this.timeline.start(this.interval)
  }
  /**
   * 执行异步任务
   * @param {*} task
   */
  _runSyncTask (task) {
    const next = () => {
      this._next()
    }
    task.taskFn(next)
  }
  /**
   * 执行下一个任务
   */
  _next () {
    this.index = this.index + 1
    this._runTask()
  }
}
