import './index.css'
import { util } from './util.js'


/**
 *
 * 无刷新表单上传组件, 浏览器不兼容FormData的话会回退到iframe提交
 *
 */

let id = 0

export class FormSubmit {
  constructor (opts) {
    if (typeof opts !== 'object') return

    this.options = Object.assign({}, FormSubmit.DEFAULTS, opts)

    this.options.type = this.options.type.toUpperCase()
    this.options.iframeId = `iframe-${id++}`
    this.options.formId = `form-${id++}`
  }

  static get DEFAULTS () {
    return {
      url: null, // 请求地址
      type: 'get', // 请求方式
      contentType: 'application/x-www-form-urlencoded', // 编码方式
      success: new Function (), // 成功回调
      error: new Function (), // 失败回调
      progress: new Function (), // 过程回调
      blankUrl: 'about:blank', // iframe默认地址
      headers: null
    }
  }

  /* ajax提交 */
  ajaxSubmit () {
    window.FormData ? this._xhrSend() : this.iframeSubmit()
  }

  _xhrSend () {
    let { type, headers, url, data, contentType, success, error } = this.options
    let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP')
    if (type === 'GET') {
      url += util.generateQuery(data)
    }
    xhr.open(type, url, true)
    if (headers) {
      for (let key in headers) {
        xhr.setRequestHeader(key, headers[key])
      }
    }
    xhr.setRequestHeader('Content-type', contentType)
    xhr.onreadystatechange = function () {
      if(xhr.readyState == 4) {
        var status = xhr.status
        if(status >= 200 && status < 300) {
            var data = xhr.responseText
            success && success(data)
        } else {
            error && error(status)
        }
      }
    }
    const formData = type === 'POST' ? util.generateFormData(data) : null
    xhr.send(formData)
  }
  /* ajax提交结束 */

  /** iframe提交开始 */
  iframeSubmit () {
    if (!this.options.iframeId || !this.options.url || !this.options.data) {
      throw new Error('Lack of parameters!')
    }

    if (this.isInit) {
      this._submit()
    } else {
      this.isInit = true
      this._renderIframe()
      // iframe插入dom后会触发一次onload, 不管src是否有效, 这一次onload没用
      // 这里可以考虑第一次不加src来解决，先不加src的话，不会触发
      this.iframe.onload = () => {
        this._bindIframeEvent()
        this._submit()
      }
    }
  }

  _submit () {
    this.form.submit()
  }

  _renderIframe () {
    util.innerHtml(document.body, 'beforeend', this._createIframeHtml())
    this.iframe = document.getElementById(this.options.iframeId)

    util.innerHtml(document.body, 'beforeend', this._createFormHtml())
    this.form = document.getElementById(this.options.formId)
  }

  _bindIframeEvent () {
    let self = this
    this.iframe.onload = null
    // 这次onload事件的触发是在提交表单后
    this.iframe.addEventListener('load', function (e) {
      try {
        // 父window操作子window
        let iframeWindow = this.contentWindow
        let href = iframeWindow.location.search
        let parseObj = util.parseQuery(href)
        if (parseObj) {
          self.options.success && self.options.success(parseObj)
        } else {
          self.options.error && self.options.error()
        }
      } catch (err) {
        console.error(err)
        self.options.error && self.options.error(err)
      }
    }, false)
  }

  _createIframeHtml () {
    let { iframeId, blankUrl } = this.options
    return `<iframe id="${iframeId}" name="${iframeId}" src="${blankUrl}" style="display:none;">`
  }

  _createFormHtml () {
    const { type, url, iframeId, contentType, data, formId } = this.options
    return `
      <form
        id="${formId}"
        action="${url}"
        method="${type}"
        enctype="${contentType}"
        target="${iframeId}"
        style="display: none"
      >
        ${
          Object.keys(data).map(key => {
            return '<input name="'+ key + '" value="'+ data[key] +'" type="hidden"/>'
          }).join('')
        }
      </form>
    `
  }
  /** iframe提交结束 */

}

/**
 *
 * 存在问题:
 * 1. iframe 是否需要先设置src, 还是直接让form action去跳转即可
 *
 * 2. iframe document.domain的问题：
 * 我的理解是：
 * 如果表单的action,跟表单所在html是同域的话，无需设置document.domain, 反之
 * 不同的话，需要设置
 *
 * 3. 对利用iframe通信的整个流程了解还不够
 */
