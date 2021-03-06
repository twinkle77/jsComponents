import './index.css'
import { util } from './util.js'
import districts from './districts'

/** 参考: https://github.com/twinkle77/100plugins/blob/master/02-distpicker.js/src/js/index.js */

export class Districts {
  constructor (opts) {
    this.options = Object.assign({}, Districts.DEFAULTS, opts)

    this._handleChange = this._handleChange.bind(this)
    this._init()
  }

  static get DEFAULTS() {
    return {
      placeholder: ["---- 选择省 ----", "---- 选择市 ----", "---- 选择区 ----"],
      selectNum: 3, // 下拉框的个数
      selected: null, // 已选值 ["130000", "130300", "130302"], ["河北省", "秦皇岛市", "海港区"]
      valueType: "name", // name or id
      name: 'select', // name: []
      change: new Function(), // 每选择一个select都会触发的回调
      callback: new Function(), // 选择完所有select才会触发的回调
      autoselect: false // 选择后第一个select,后面的select自动选择
    }
  }

  _init () {
    this._renderDom()
    this._bindEvent()
  }

  /** dom渲染开始 */
  _renderDom () {
    const { el } = this.options

    util.insertHtml(el, 'beforeend', this._createSelect())

    this.selectEls = el.querySelectorAll('select')

    // 如果提供初始化的值
    if (!!this.options.selected) {
      this._initSelected()
    } else {
      this._createOption(100000, 0)
    }
  }

  _initSelected () {
    // 该数组的最后一个索引是不用用来递归的，只是用来确定最好一个select的selectedIndex而已
    let selectedArr = ['100000'].concat(this.options.selected)

    let whileArr = selectedArr.filter((value, index) => index <= this.selectEls.length - 1)
    // 填充
    let diff = this.selectEls.length - whileArr.length
    if (diff > 0) {
      for (let i = 0 ; i < diff; i++) {
        whileArr.push(0)
      }
    }

    let self = this;
    (function fn (code, index) {
      let selectEl = self.selectEls[index]
      let mes = districts[code] || {}

      let optionHtml = `<option>${self.options.placeholder[index]}</option>`
      optionHtml += Object.keys(mes).map(key => {
        return `<option value="${key}">${mes[key]}</option>`
      }).join('')

      selectEl.innerHTML = optionHtml

      let selectedIndex = selectedArr[index + 1] && mes && (Object.keys(mes).findIndex(key => key == selectedArr[index + 1]))
      selectEl.selectedIndex = selectedIndex + 1

      if (index + 1 <= whileArr.length - 1) {
        fn(selectedArr[index + 1], index + 1)
      }
    })('100000', 0)
  }

  /**
   *
   * @param {*} code 地区id
   * @param {*} index 表示第index个select,总共有3个select
   */
  _createOption (code, index, selectedIndex) {
    let selectEl = this.selectEls[index]
    if (!selectEl) return
    /** 关键代码一： code为0或者districts[0]为空或者“---- 选择省 ----” */
    let mes = districts[code] || false // 防止获取为空

    let optionHtml = `<option>${this.options.placeholder[index]}</option>`
    mes && (optionHtml += Object.keys(mes).map(key => {
      return `<option value="${key}">${mes[key]}</option>`
    }).join(''))

    selectEl.innerHTML = optionHtml

    selectedIndex = mes && selectedIndex ? selectedIndex : 0
    selectEl.selectedIndex = selectedIndex

    /** 关键代码二：递归构造dom, 附带清空select的功能 */
    while (this.selectEls.length - index > 1) {
      index++
      this._createOption(0, index, selectedIndex)
    }
  }

  _createSelect () {
    let selectHtml = ''
    for (let i = 0; i < this.options.selectNum; i++) {
      selectHtml += '<select></select>'
    }
    return selectHtml
  }

  /** 事件绑定开始 */
  _bindEvent () {
    let self = this
    this.selectEls.forEach((el, index) => {
      el.index = index
      el.addEventListener('change', this._handleChange, false)
    })
  }

  _handleChange (e) {
    let target = e.target
    let index = target.index
    let value = target.value

    if (this.options.autoselect) {
      /** 自动选择代码: 下面几行代码可能有些问题 */
      let i = index
      let code = this._getCode(value) // code数组的最后一个areaId其实不用用到
      for (let i = 0; i < Math.max(code.length - 1, 1); i++) {
        this._createOption(code[i], index + 1 + i, 1)
      }
      index = this.selectEls.length - 1
    } else {
      index !== this.selectEls.length - 1 && this._createOption(value, index + 1)
    }

    let res = []
    let i = 0
    while (i <= index) {
      let selectEl = this.selectEls[i]
      res.push(
        {
          code: selectEl[selectEl.selectedIndex].value,
          name: selectEl[selectEl.selectedIndex].text
        }
      )
      i++
    }

    this.options.change && this.options.change({ [this.options.name] : res })

    index === this.selectEls.length - 1 && this.options.callback && this.options.callback({ [this.options.name] : res })
  }

  /** 数据处理方法开始 */
  // 根据id,获取id的子id, 孙子id....
  _getCode (id) {
    let code = []
    let i = 1

    let curId = id
    let curObj = districts[id]
    code.push(id)

    // while (i <= this.selectEls.length - 1) {
    //   if (!curObj) {
    //     break
    //   }
    //   curId = Object.keys(curObj)[0]
    //   code.push(curId)
    //   curObj = districts[curId]
    //   i++
    // }

    for (let i = 1; i <= this.selectEls.length - 1; i++) {
      if (curObj) {
        curId = Object.keys(curObj)[0]
        code.push(curId)
        curObj = districts[curId]
      }
    }

    return code
  }

  /** 公用方法开始 */
  reset () {
    if (!!this.options.selected) {
      this._initSelected()
    } else {
      this._createOption(100000, 0)
    }
  }

  destory () {
    Array.from(this.selectEls).forEach((item, index) => {
      this.selectEls[index].innerHTML = ''
      item.removeEventListener('change', this._handleChange, false)
    })
  }

  getValue () {
    return Array.from(this.selectEls).map(item => {
      return {
        code: item[item.selectedIndex].value,
        name: item[item.selectedIndex].text
      }
    })
  }

  getCode (name, obj) {
    obj = obj || districts
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      if (typeof obj[key] === 'object') {
        return this.getCode(name, obj[key])
      } else if (name == obj[key]){
        return key
      }
    }
    return null
  }
}
