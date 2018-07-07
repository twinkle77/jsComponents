'use strict'

import './index.css'
import loadImage from './loadImage'
import { util } from './util.js'

// 同步任务
const TASK_SYNC = 0
// 异步任务
const TASK_ASYNC = 1

export class Animation {
  constructor () {
    this.taskQueue = []
    this.index = 0
  }
  /**
   * 预加载图片
   * @param {*} imglist 图片地址数组
   */
  loadImage (imglist) {
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

  }
  /**
   * 添加一个异步定时任务
   * 通过定时改变元素的src或backgroundImage，实现帧动画
   * @param {*} el
   * @param {*} imglist
   */
  changeSrc (el, imglist) {

  }
  /**
   * 添加一个异步定时任务
   * 该任务自定义动画每帧执行的任务函数
   * @param {*} taskFn 每帧执行的任务函数
   */
  enterFrame (taskFn) {

  }
  /**
   * 添加一个同步任务
   * 可以在上一个任务完成执行后执行该回调函数
   * @param {*} callback
   */
  then (callback) {}
  /**
   * 开始执行任务
   * @param {*} interval 异步定时任务执行的间隔
   */
  start (interval) {

  }
  /**
   * 添加一个同步任务，该任务就是回退到上一个任务中
   * 实现重复上一个任务的效果，可定义重复的次数
   * @param {*} times 重复执行的次数
   */
  repeat (times) {}
  /**
   * 添加一个同步任务
   * 无限循环上一次任务 = repeat()
   */
  repeatForever () {}
  /**
   * 当前任务结束后下一个任务开始前的等待时间
   * @param {*} time 等待时长
   */
  wait (time) {}
  /**
   * 暂停当前执行的异步定时任务
   */
  pause () {}
  /**
   * 重新开始执行之前被停止过异步定时任务
   */
  restart () {}
  /**
   * 释放资源
   */
  dispose () {}
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
}


