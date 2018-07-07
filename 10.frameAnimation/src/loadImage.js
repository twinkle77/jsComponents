'use strict'

// 加载中
const LOADING = 'loading'
// 加载完成
const LOADED = 'loaded'
// 加载错误
const ERROR = 'error'

/**
 * 图片预加载
 * @param {*} imglist 预加载的图片数据或对象
 * @param {*} callback 全部图片加载完毕后的会调用的回调函数
 * @param {*} timeout 加载超市的时长。超过这个时间会条用callback
 */
function loadImage (imglist, callback, timeout) {
  // 加载完成的图片的计数器
  let count = 0
  // 所有图片成功加载完时的标志位
  let success = true
  // 计时器的id
  let timeoutId = 0
  // 是否超时标志位
  let isTimeout = false

  for (let key in imglist) {
    // 过滤掉prototype的属性
    if (!imglist.hasOwnProperty(key)) continue
    let item = imglist[key]
    // 如果item是个字符串，那么构造成一个object = {src: '', id: '', img: ''}
    if (typeof item === 'string') {
      item = imglist[key] = {
        src: item
      }
    }
    if (!item || !item.src) continue
    // 计数+1
    count++
    // 设置图片的id
    item.id = `__img__${key}${getId()}`
    // 设置图片元素的img,是一个Image对象
    item.img = window[item.id] = new Image()
    doLoad(item)
  }

  // 遍历完成后如果计数为0，则直接调用
  if (!count) {
    callback(success)
  } else if (timeout) {
    timeoutId = setTimeout(timeoutFn, timeout)
  }

  /**
   * 真正进行图片加载的函数
   * @param {*} item 图片对象 {src: '', id: '', img: ''}
   */
  function doLoad (item) {
    item.status = LOADING
    let img = item.img
    // 图片加载成功
    img.onload = function () {
      // 只有之前图片多加载成功，success才会为true
      success = success && true
      img.status = LOADED
      done()
    }
    // 图片加载失败
    img.onerror = function () {
      // 若有一张图片加载失败，则为失败
      success = false
      img.status = ERROR
      done()
    }
    // 发起一个http(s)请求加载图片
    img.src = item.src
    /**
     * 每张图片加载完成后的回调。用来判断所有图片是否加载完成
     */
    function done () {
      // 清理事件
      img.onload = img.onerror = null
      try {
        delete window[img.id]
      } catch (e) {

      }
      --count
      /**
       * count为0，说明所有图片加载完成
       * 如果未超时，需要清除定时器
       * 如果超时，那么无需再出发callback
       */
      if (!count && !isTimeout) {
        clearTimeout(timeoutId)
        callback(success)
      }
    }
  }

  /**
   * 超时函数
   */
  function timeoutFn () {
    isTimeout = true
    callback(success)
  }
}

let __id = 0

function getId () {
  return __id++
}

export default loadImage
