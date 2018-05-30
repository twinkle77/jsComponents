export const util = {
  removeElement (el) {
    el && el.parentNode && el.parentNode.removeChild(el)
  },
  // http://www.zhangxinxu.com/wordpress/2013/05/js-dom-basic-useful-method/
  insertHtml (el, pos, html) {
    let positions = ['beforebegin', 'afterbegin', 'beforeend', 'afterend']
    if (!positions.includes(pos)) {
      throw new TypeError(`'position' must be one of them ${positions.join('、')}`)
    }
    el.insertAdjacentHTML(pos, html)
  }
}
