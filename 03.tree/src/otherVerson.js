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
    this._renderDom()
    this._bindEvent()
  }

  _bindEvent () {
    this.options.container.addEventListener('click', (e) => {
      let target = e.target
      // 点击了展开符
      if (util.hasClass(target, 'tree-expanded')) {
        this._expandEvent(target)
        this.options.onExpand()
      // 点击了复选框
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
        childInput.indeterminiate = false
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

  // 获取选中值
  getChecked () {
    this.treeRoot = this.options.container.querySelector('ul.tree-el');
    return (function getData(root) {
      let checked = []
      Array.from(root.children).forEach(li => {
        const curCheckbox = li.firstElementChild.querySelector('input[type="checkbox"]')
        if (curCheckbox.checked) {
          checked.push(curCheckbox.value)
        }
        if (li.children.length === 2) {
          const curUl = li.lastElementChild
          checked = checked.concat(getData(curUl))
        }
      })
      return checked
    })(this.treeRoot)
  }

  // 摧毁
  destory () {
    util.removeElement(this.treeRoot)
  }
}
