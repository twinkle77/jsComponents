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
        let curPath = parentPath ? `${parentPath}.${index+1}` : `${index+1}`
        return Object.assign({}, item, {
          path: curPath,
          children: item.children && item.children.length ? setPath(item.children, curPath) : []
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
                  path="${item.path}"
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
    })(this.options.nodes)
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

  }

  // 获取选中值
  getChecked () {

  }

  // 摧毁
  destory () {
    util.removeElement(this.treeRoot)
  }
}
