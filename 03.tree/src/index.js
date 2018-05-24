import './index.css'
import { util } from './util.js'

export class Tree {
  constructor (options) {
    this.options = Object.assign({}, Tree.DEFAULTS, options)
    if (typeof this.options.container === 'string') {
      this.options.container = document.querySelector(this.options.container)
    }
    this._init()
  }

  static get DEFAULTS () {
    return {
      nodes: [],
      checkbox: true,
      accordion: false,
      onCheck: new Function (),
      onExpand: new Function ()
    }
  }

  _init () {
    this.customNodes = this._setPath(this.options.nodes)
    this._renderDom()
    this.customNodes = this._getPath(this.customNodes)
    this._bindEvent()
  }

  /**
   * 构造数据结构，改成自己需要的数据结构
   * @param {*} nodes
   * nodes是一个数组[{}, { chidlren[] }]
   * 当前节点的path由该节点在数组中的位置决定，1.2.1
   */
  _setPath (nodes) {
    return (function setPath(nodes, parentPath) {
      return nodes.map((item, index) => {
        let curPath = parentPath ? `${parentPath}.${index}` : `${index}`
        return Object.assign({}, item, {
          path: curPath,
          children: item.children && item.children.length ? setPath(item.children, curPath) : []
        })
      })
    })(nodes)
  }

  /**
   *
   * @param {*} nodes
   * 在当前node添加当前checkbox元素节点
   *
   */
  _getPath (nodes) {
    let self = this
    return (function getPath (nodes) {
      return nodes.map(curNode => {
        return Object.assign({}, curNode, {
          checkboxEl: self.options.container.querySelector(
            `[data-path="${curNode.path}"]`
          ),
          children: curNode.children ? getPath(curNode.children) : []
        })
      })
    })(nodes)
  }

  _bindEvent () {
    this.options.container.addEventListener('click', (e) => {
      let target = e.target
      if (util.hasClass(target, 'tree-expanded')) {
        this._expandEvent(target)
        this.options.onExpand()
      } else if (util.hasClass(target, 'tree-checkbox')) {
        this._checkboxEvent(target)
        this.options.onCheck()
      }
    }, false)
  }

  _renderDom () {
    let html = (function createHtml (nodes) {
      return nodes.map(item => {
        return `
          <li class="tree-parent${item.expanded ? ' expanded' : ''}">
            <div class="tree-text">
              ${item.children && item.children.length > 0 ? '<span class="tree-expanded"></span>' : ''}
              <span class="tree-checked">
                <input
                  class="tree-checkbox"
                  type="checkbox"
                  data-path="${item.path}"
                  value="${item.value}"
                  ${item.checked ? 'checked': '' }
                />
              </span>
              <span class="tree-label">${item.label}</span>
            </div>
            ${item.children && item.children.length ? '<ul>' + createHtml(item.children) + '</ul>': '' }
          </li>
        `
      }).join('')
    })(this.customNodes)
    html = `<ul class="tree-el">${html}</ul>`
    util.innerHtml(this.options.container, 'beforeend', html)
  }

  _expandEvent (target) {
    const liParent = util.closest(target, '.tree-parent')
    util.toggleClass(liParent, 'expanded')
    if (this.options.accordion) {
      const ulParent = util.closest(target, 'ul')
      Array.from(ulParent.children)
        .filter(children => children !== liParent)
        .forEach(item => util.removeClass(item, 'expanded'))
    }
  }


  _checkboxEvent (target) {
    let self = this
    let path = target.dataset.path.split('.')
    let copyPath = [...path]
    let curConfig = this._getCurConfig(path)
    let checked = target.checked;

    // 向下传播
    (function spreadDown (node){
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          child.checkboxEl.checked = checked
          child.checkboxEl.indeterminate = false
          spreadDown(child)
        })
      }
    })(curConfig);

    // 向上传播
    (function spreadUp () {
      if (copyPath.length <= 1) return
      copyPath.pop()
      let parentConfig = self._getCurConfig(copyPath)
      let checkboxLength = parentConfig.children.length
      let checkedLength = parentConfig.children.filter(item => item.checkboxEl.checked).length
      let indeterminateLength = parentConfig.children.filter(item => item.checkboxEl.indeterminate).length
      parentConfig.checkboxEl.checked = checkboxLength === checkedLength
      parentConfig.checkboxEl.indeterminate = (checkboxLength > checkedLength && checkedLength !== 0) || indeterminateLength > 0
      spreadUp()
    })()
  }

  _getCurConfig ([...path]) {
    let curConfig = null
    let pos = path.shift()
    curConfig = this.customNodes[pos]
    while (path.length > 0) {
      pos = path.shift()
      curConfig = curConfig.children[pos]
    }
    return curConfig
  }

  // 获取选中值
  getChecked () {
    let checked = [];
    (function getChecked(nodes){
      nodes.forEach(item => {
        if (item.checkboxEl.checked) {
          checked.push(item.value)
        }
        item.children && getChecked(item.children)
      })
    })(this.customNodes)
    return checked
  }

  // 摧毁
  destory () {
    util.removeElement(this.treeRoot)
  }
}
