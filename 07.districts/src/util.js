export const util = {
  insertHtml (el, pos, html) {
    let positions = ['beforebegin', 'afterbegin', 'beforeend', 'afterend']
    if (!positions.includes(pos)) {
      throw new TypeError(`'position' must be one of them ${positions.join('、')}`)
    }
    el.insertAdjacentHTML(pos, html)
  }
}
