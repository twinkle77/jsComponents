import './index.css'
import { util } from './util.js'

export class Upload {
  constructor (options) {
    if (typeof options === 'undefined') {
      throw new Error('Uploader required `options`')
    } else if (options.target == null) {
      throw new Error('Uploader required `target` option')
    }

    this.options = Object.assign({}, Upload.DEFAULTS, options)

    if (!(options.target instanceof Element)) {
      this.options.target = document.querySelectorAll(options.target)[0]
    }
    if (!(options.fileList instanceof Element)) {
      this.options.fileList = document.querySelectorAll(options.fileList)[0]
    }
    // 存储上传的文件
    this.fileList = []
    this._init()
  }

  // 默认参数
  static get DEFAULTS () {
    return {
      paramName: 'file',
      maxFiles: 10,
      maxFilesSize: 512,
      acceptedFiles: '.jpg, .jpeg, .png, .gif',
      addRemoveLinks: false,
      uploadMultiple: true,
      autoUpload: true,
      headers: null,
      addedFile: new Function (),
      removedFile: new Function (),
      start: new Function (),
      abort: new Function (),
      success: new Function (),
      error: new Function (),
      complete: new Function (),
      uploadProgress: new Function (),
      message: {
        uploadText: '将文件拖到次数，或点击上传',
        maxFilesText: '到达最多上传数目',
        maxFilesSizeText: '文件过大',
        singleFileText: '只能上传单个文件',
        acceptedFilesText: '不支持该文件格式'
      },
      messageFn:  function (tip) {
        alert(tip)
      },
      change: true // 切换上传与追加上传
    }
  }

  // 初始化
  _init () {
    this._createUploader()
    this._createFileList()
    this._bindEvent()
  }

  // render
  _createUploader () {
    const { target, message, paramName, uploadMultiple } = this.options
    let multiple = uploadMultiple ? 'multiple="multiple"' : ''
    target.insertAdjacentHTML(
      'beforeend',
      `
        <div class="upload_container">
          <div class="upload_dragger">
            <span class="upload_icon"></span>
            <span class="upload_text">${message.uploadText}</span>
            <input type="file" name="${paramName}" class="file_input" id="file_input" ${multiple}>
          </div>
        </div>
      `
    )
    this.uploadContainer = target.querySelector('.upload_container')
    this.fileInput = target.querySelector('.file_input')
  }

  _createFileList () {
    const { fileList } = this.options
    fileList.insertAdjacentHTML(
      'beforeend',
      `<div class="fileList_container"></div>`
    )
    this.fileListContainer = fileList.querySelector('.fileList_container')
  }

  _createPreview (newFileList) {
    const { change, addRemoveLinks } = this.options
    if (change) {
      this.fileListContainer.innerHTML = ''
    }
    newFileList.forEach((file, index) => {
      // 赋予file文件对象唯一的index
      file.index = util.randomId(10)
      let ObjectURL
      if (window.URL) {
        ObjectURL = window.URL.createObjectURL(file)
      } else if (window.webkitURL) {
        ObjectURL = window.webkitURL.createObjectURL(file)
      }
      this.fileListContainer.insertAdjacentHTML(
        'beforeend',
        `
          <div class="fileItem" data-index="${file.index}">
            <img class="imgPreview" src="${ObjectURL}">
            <div class="imgInfo">
              <p class="infoName">${file.name}</p>
              ${addRemoveLinks ? '<span class="imgDel" data-index="'+ file.index +'">x</span>' : ''}
              <span class="imgUploaded"></span>
              <span class="progressbar">
            </div>
          </div>
        `
      )
    })
  }
  // bindEvent
  _bindEvent () {
    this.uploadContainer.addEventListener('dragenter', (e) => {
      e.preventDefault()
    }, false)
    this.uploadContainer.addEventListener('dragleave', (e) => {
      e.preventDefault()
      this.uploadContainer.classList.remove('dragenter')
    }, false)
    this.uploadContainer.addEventListener('dragover', (e) => {
      e.preventDefault()
      this.uploadContainer.classList.add('dragenter')
    }, false)
    // 放下文件上传
    this.uploadContainer.addEventListener('drop', (e) => {
      this._handleFile(e)
    }, false)
    // 点击上传
    this.uploadContainer.addEventListener('click', (e) => {
      this.fileInput.click() // 主动触发
    }, true)
    this.fileInput.addEventListener('change', (e) => {
      this._handleFile(e)
    }, false)
    // 点击“x”按钮
    this.options.fileList.addEventListener('click', (e) => {
      this._handleDel(e)
    }, false)
  }

  // 业务逻辑
  _handleFile (e) {
    e.preventDefault() // 防止拖拽释放后浏览器默认打开文件
    const { autoUpload, change, maxFilesSize, messageFn, message, acceptedFiles, maxFiles, uploadMultiple, addedFile } = this.options
    let fileList = e.type === 'drop' ? [].slice.call(e.dataTransfer.files) : [].slice.call(this.fileInput.files)
    if (!fileList.length) return
    // 判读文件类型、大小
    let flag = fileList.every((file) => {
      let { type, size } = file
      if (size > maxFilesSize * 1024) {
        messageFn(message.maxFilesSizeText)
        return false
      }
      if (type.indexOf('image') === -1 || acceptedFiles.indexOf(type.split('/')[1]) === -1) {
        messageFn(message.acceptedFilesText)
        return false
      }
      return true
    })
    // 判断文件个数
    if (!uploadMultiple && fileList.length > 1) {
      messageFn(message.singleFileText)
      flag = false
      return
    }
    if (change) { // 切换上传
      this.fileList = fileList
      if (this.fileList.length > maxFiles) {
        messageFn(message.maxFilesText)
        flag = false
        return
      }
    } else { // 追加上传
      this.fileList.push(...fileList)
      if (maxFiles < this.fileList.length) {
        let diff = this.fileList.length - maxFiles
        this.fileList.splice(this.fileList.length - diff, diff)
        fileList.splice(fileList.length - diff, diff)
        messageFn(message.maxFilesText)
      }
    }
    // 验证成功，可以上传
    if (flag) {
      this._createPreview(fileList)
      change ? addedFile(fileList, '切换上传不保存旧图片') : addedFile(fileList, this.fileList) // 添加文件后的回调
      autoUpload && this._uploadOpen(fileList)
    }
  }

  // 点击'x'删除文件
  _handleDel (e) {
    let target = e.target
    let nodeName = target.nodeName.toLowerCase()
    if (nodeName === 'span') {
      let index = target.dataset['index']
      let delIndex = this.fileList.findIndex(file => {
        return file.index === index
      })
      let delFile = this.fileList.splice(delIndex, 1)
      this.options.removedFile(delFile, this.fileList)
      let fileItem = target.parentNode.parentNode
      fileItem.parentNode.removeChild(fileItem)
    }
  }

  // 开启上传
  _uploadOpen (fileList) {
    fileList.forEach(file => {
      this._uploadSend(file)
    })
  }

  // 开始上传
  _uploadSend (file) {
    const { url, paramName, headers } = this.options
    let xhr = new XMLHttpRequest()
    let formData = new FormData()
    formData.append(paramName, file)

    // 寻找该file对应的progressbar
    let targetFileItem = null
    Array.from(this.fileListContainer.querySelectorAll('.fileItem'))
      .forEach(item => {
        if (item.dataset.index === file.index) {
          targetFileItem = item
          return
        }
      })
    let progressbar = targetFileItem.querySelector('.progressbar')

    xhr.open('post', url, true)
    if (headers) {
      for (let key in headers) {
        xhr.setRequestHeader(key, headers[key])
      }
    }
    xhr.onloadstart = this._xhrStart.bind(this, file)
    xhr.onabort = this._xhrAbort.bind(this, file)
    xhr.onload = this._xhrLoad.bind(this, file, targetFileItem)
    xhr.onerror = this._xhrError.bind(this, file, targetFileItem)
    xhr.upload.onprogress = this._xhrProgress.bind(this, file, progressbar)
    xhr.send(formData)
  }

  // 上传开始
  _xhrStart (file, event) {
    this.options.start(event)
    console.log('start')
  }

  // 上传中断
  _xhrAbort (event) {
    this.options.abort(event)
    console.log('abort')
  }

  // 上传完成
  _xhrLoad (file, fileItem, event) {
    console.log('load')
    fileItem.classList.add('success')
    fileItem.classList.add('complete')
    this.options.success(file, fileItem)
    this.options.complete(file, fileItem)
  }

  // 上传出错
  _xhrError (file, fileItem, event) {
    console.log('error')
    fileItem.classList.add('error')
    fileItem.classList.add('complete')
    this.options.error(file, fileItem)
    this.options.complete(file, fileItem)
  }

  // 上传中
  _xhrProgress (file, progressbar, event) {
    if (event.lengthComputable) {
      console.log('progress')
      let percent = (event.loaded / event.total) * 100
      progressbar.style.width = `${percent}%`
    }
  }

  // 手动控制上传(切换上传才具备此功能)
  upload () {
    this.options.change && this._uploadOpen(this.fileList)
  }
}

/**
 * 所得：我觉除了赋予file文件对象id外，还应该赋予其一个isUpload的标志
 * 这样，在追加上传的时候更容易控制
 * 手动上传（追加上传不具备此功能）就是因为不知道this.fileList里面的file对象是否上传了，才难以实现
 */
