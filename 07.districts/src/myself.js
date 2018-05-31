import './index.css'
import { util } from './util.js'
import districts from './districts'

let provinceId = '100000'
/** city area */

export class Districts {
  constructor (opts) {
    this.options = Object.assign({}, Districts.DEFAULTS, opts)
    this._init()
  }

  static get DEFAULTS() {
    return {
      placeholder: ["---- 选择省 ----", "---- 选择市 ----", "---- 选择区 ----"],
      autoselect: null,
      valueType: "name",
      callback: new Function(),
      autochange: false
    }
  }

  _init () {
    this._renderDom()
    this._bindEvent()
  }

  _bindEvent () {
    let self = this
    /**
     *
     * 优化一：事件用for循环来绑定
     * 优化二：事件处理程序，逻辑其实相似，可封装在一起
     *
     */
    this.provinceEl.addEventListener('change', function (e) {
      let cityId = parseInt(e.target.value)
      if (!Number.isNaN(cityId)) {
        self._clearArea()
        self._createCity (cityId)
      } else {
        self._clearArea()
        self._clearCity()
      }
    })
    this.cityEl.addEventListener('change', function (e) {
      let areaId = e.target.value
      if (!Number.isNaN(areaId)) {
        self._createArea (areaId)
      }
    })
  }

  _renderDom () {
    const { el } = this.options
    util.insertHtml(el, 'beforeend', this._createSelect())

    let [provinceEl, cityEl, areaEl] = el.querySelectorAll('select')
    this.provinceEl = provinceEl
    this.cityEl = cityEl
    this.areaEl = areaEl

    this._createProvince()
  }

  /** 优化3：下面两个clear可封装 */
  _clearArea () {
    this.areaEl.innerHTML = `
      <option>${this.options.placeholder[2]}</option>
    `
  }

  _clearCity () {
    this.cityEl.innerHTML = `
      <option>${this.options.placeholder[1]}</option>
    `
  }

  /** 优化4：下面3个create逻辑其实差不多，可封装 */
  _createArea (areaId) {
    let areaObj = districts[areaId]
    if (!areaObj) areaObj = {} // 台湾省 等特殊情况

    let areaHtml = this._createOption(areaObj)
    let areaPlaceholder = this.options.placeholder[2]

    this.areaEl.innerHTML = `
      ${false ? '' : '<option>' + areaPlaceholder + '</option>'}
      ${areaHtml}
    `

    if (this.options.autochange && districts[areaId]) {
      this.areaEl.options.selectedIndex = 1
    }
  }

  _createCity (proId) {
    let cityObj = districts[proId]
    if (!cityObj) cityObj = {} // 台湾省 等特殊情况

    let cityHtml = this._createOption(cityObj)
    let cityPlaceholder = this.options.placeholder[1]

    this.cityEl.innerHTML = `
      ${false ? '' : '<option>' + cityPlaceholder + '</option>'}
      ${cityHtml}
    `

    if (this.options.autochange && districts[proId]) {
      this.cityEl.options.selectedIndex = 1
      this._createArea(this.cityEl.options[1].value)
    }

    // util.insertHtml(this.cityEl, 'beforeend', cityHtml)
  }

  _createProvince () {

    let provinceObj = districts[provinceId]
    let provinceHtml = this._createOption(provinceObj)

    util.insertHtml(this.provinceEl, 'beforeend', provinceHtml)
  }

  _createOption (mesObj) {
    return Object.keys(mesObj).map(key => {
      return `
        <option value="${key}">${mesObj[key]}</option>
      `
    }).join('')
  }

  _createSelect () {
    return this.options.placeholder.map(txt => {
      return `
        <select>
          <option>${txt}</option>
        </select>
      `
    }).join('')
  }
}

/**
 *
 * <select></select>的属性
 * options 获取select下的所有option元素
 * selectedIndex 获取当前选中的options的index, 可读可写, 写的时候value也对应着改变
 * value select当前所选option的value
 * selectedOptions 获取当前选中的options, 是一个数组
 * selectEl.options[selectEl.selectedIndex].value 当前选中options的value值
 * selectEl.options[selectEl.selectedIndex].text 当前选中options的文本值
 * 选中不变的option,不会触发change事件
 * option的操作:
 * https://blog.csdn.net/qq877507054/article/details/52388372
 * https://www.cnblogs.com/duanhuajian/archive/2013/06/09/3129365.html
 */
