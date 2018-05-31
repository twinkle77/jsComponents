import './index.css'
import { util } from './util.js'

export class Districts {
  constructor (opts) {
    this.options = Object.assgin({}, Districts.DEFAULTS, opts)
  }

  static get DEFAULTS() {
    return {
      placeholder: ["---- 选择省 ----", "---- 选择市 ----", "---- 选择区 ----"],
      autoselect: null,
      valueType: "name",
      callback: new Function()
    }
  }
}
