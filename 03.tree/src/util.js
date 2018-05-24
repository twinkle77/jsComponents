export const util = {
  innerHtml (el, position, html) {
    let positions = ['beforebegin', 'afterbegin', 'beforeend', 'afterend']
    positions.includes(position) && el.insertAdjacentHTML(position, html)
  },
  hasClass (el, className) {
    return el.classList.contains(className)
  },
  addClass (el, className) {
    if (util.hasClass(el, className)) return
    el.classList.add(className)
  },
  removeClass (el, className) {
    if (!util.hasClass(el, className)) return
    el.classList.remove(className)
  },
  toggleClass (el, className) {
    el.classList.toggle(className)
  },
  // 寻找离el元素最近的符合selector选择器的父元素
  // el->body->html->document。document没有matches方法，所以需要提前退出
  closest (el, selector) {
    let matches = matchesSelector(el)
    while (el) {
      if (matches.call(el, selector)) break
      el = el.parentNode
      if (el == document) return el = false
    }
    return el
  },
  removeElement (el) {
    el && el.parentNode && el.parentNode.removeChild(el)
  }
}


/**
 * 参考:https://www.lyblog.net/detail/601.html JavaScript中matches(matchesSelector)的兼容写法
 */

 function matchesSelector (el) {
   const browser = ['matches', 'matchesSelector', 'webkitMatchesSelector',
  'msMatchesSelector', 'mozMatchesSelector', 'oMatchesSelector']
  for (let i = 0; i < browser.length; i++) {
    if (el[browser[i]]) return el[browser[i]]
  }
 }
