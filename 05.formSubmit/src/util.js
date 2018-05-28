export const util = {
  innerHtml (el, position, html) {
    let positions = ['beforebegin', 'afterbegin', 'beforeend', 'afterend']
    positions.includes(position) && el.insertAdjacentHTML(position, html)
  },
  parseQuery (queryStr) {
    if (!queryStr) return
    queryStr = queryStr.slice(1, queryStr.length)
    let keyValue = queryStr.split('&')
    let res = {}
    keyValue.forEach(item => {
      let arr = item.split('=')
      res[arr[0]] = arr[1]
    })
    return res
  },
  generateQuery (data) {
    let str = ''
    Object.keys(data).forEach(key => {
      str += `&${key}=${data[key]}`
    })
    str = str.slice(1, str.length)
    return `?${str}`
  },
  generateFormData (data) {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })
    return formData
  }
}
