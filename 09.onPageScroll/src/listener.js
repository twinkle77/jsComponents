function isNode (value) {
  return value !== 'undefined' && value instanceof HTMLElement && value.nodeType === 1
}

function isWindow (value) {
  let type = Object.prototype.toString.call(value)
  return type === '[object Window]' || type === '[object HTMLDocument]' || type === '[object HTMLBodyElement]'
}

function isNodeList (value) {
  let type = Object.prototype.toString.call(value)
  return type === '[object NodeList]' || type === '[object HTMLCollection]' || (
    'length' in value && isNode(value[0])
  )
}

function isString (value) {
  return typeof value === 'string' || value instanceof String
}

function isFn (value) {
  return typeof value === 'function'
}

function listenNode (node, type, callback) {
  node.addEventListener(type, callback)
  return {
    destory: function () {
      node.removeEventListener(type, callback)
    }
  }
}

function listenNodeList (nodelist, type, callback) {
  let nodeList = Array.from(nodelist)
  nodeList.forEach(node => {
    node.addEventListener(type, callback)
  })
  return {
    destory: function () {
      nodeList.forEach(node => {
        node.removeEventListener(type, callback)
      })
    }
  }
}

function listen (target, type, callback) {
  if (!target || !type || !callback) {
    throw new Error('Missing required arguments')
  }

  if (!isString(type)) {
    throw new Error('Second argument muse be a string')
  }

  if (!isFn(callback)) {
    throw new Error('Third argument must be a function')
  }

  if (isNode(target) || isWindow(target)) {
    return listenNode(target, type, callback)
  } else if (isNodeList(target)) {
    return listenNodeList(target, type, callback)
  } else if (isString(target)) {
    return listenNodeList(document.querySelectorAll(target), type, callback)
  } else {
    throw new TypeError(
      'First argument must be a String, HTMLElement, HTMLCollection, NodeList or Window'
    )
  }
}

export default listen
