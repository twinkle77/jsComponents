import './index.css'
import { util } from './util.js'

export class Tree {
  constructor (options) {
    this.options = Object.assign({}, Tree.DEFAULTS, options)
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
      // 点击了展开符
      if (util.hasClass(target, 'tree-expanded')) {
        this._expandEvent(target)
      // 点击了复选框
      } else if (util.hasClass(target, 'tree-checkbox')) {
        this._checkboxEvent(target)
      }
    }, false)
  }

  _renderDom () {
    let html = (function createHtml (nodes) {
      return nodes.map(item => {
        return `
          <li class="tree-parent${item.expanded ? ' expanded' : ''}">
            <div class="tree-text">
              <span class="tree-expanded"></span>
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
    })(this.customNodes)
    html = `<ul class="tree-el">${html}</ul>`
    util.innerHtml(this.options.container, 'beforeend', html)
  }

  // 点击了<span class="tree-expanded"></span>, 找其父li.tree-parent
  _expandEvent (target) {
    const liParent = util.closest(target, '.tree-parent')
    util.toggleClass(liParent, 'expanded')
    // 手风琴效果，一个打开，其他就关闭
    if (this.options.accordion) {
      const ulParent = util.closest(target, 'ul')
      Array.from(ulParent.children)
        .filter(children => children !== liParent)
        .forEach(item => util.removeClass(item, 'expanded'))
    }
  }

  // 两个iife报错问题：https://stackoverflow.com/questions/42036349/uncaught-typeerror-intermediate-value-is-not-a-function

  _checkboxEvent (target) {
    // 向下传播
    (function spreadDown (curInput) {
      let parentLi = util.closest(curInput, 'li')
      if (parentLi.children.length !== 2) return
      let curUl = parentLi.lastElementChild
      Array.from(curUl.children).forEach(li => {
        let childInput = li.firstElementChild.querySelector('[type="checkbox"]')
        childInput.checked = curInput.checked
        spreadDown(childInput)
      })
    })(target);

    // 向上传播
    (function spreadUp (curInput) {
      // 拿到同层级checked数量
      let ulParent = util.closest(curInput, 'ul')
      let curCheckboxs = Array.from(ulParent.children)
        .map(li => {
          return li.firstElementChild.querySelector('[type="checkbox"]')
        })
      let checkedLength = curCheckboxs.filter(checkbox => {
        return checkbox.checked === true
      }).length
      let indeterLength = curCheckboxs.filter(checkbox => {
        return checkbox.indeterminate === true
      }).length
      // 拿到同层级元素数量
      let checkboxlength = ulParent.children.length
      // 对比
      if (!util.closest(ulParent, 'li.tree-parent')) {
        return
      }
      let parentCheckbox = util.closest(ulParent, 'li.tree-parent').firstElementChild.querySelector('[type="checkbox"]')
      if (checkedLength === checkboxlength) { // 全选
        parentCheckbox.checked = true
        parentCheckbox.indeterminate = false
        spreadUp(parentCheckbox)
      } else if (checkedLength < checkboxlength && checkedLength > 0 || indeterLength > 0) {
        parentCheckbox.indeterminate = true
        parentCheckbox.checked = false
        spreadUp(parentCheckbox)
      } else if (checkedLength === 0) {
        parentCheckbox.indeterminate = false
        parentCheckbox.checked = false
        spreadUp(parentCheckbox)
      }
    })(target)

  }
}
