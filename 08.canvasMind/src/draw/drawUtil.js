
/**
 *
 * @param {*} x 矩形起点x
 * @param {*} y
 * @param {*} w 宽度
 * @param {*} h 高度
 * @param {*} r border-radius
 */
export function drawRect (ctx,x,y,width,height,radius) {
  ctx.beginPath()
  ctx.moveTo(x,y+radius)
  ctx.lineTo(x,y+height-radius)
  ctx.quadraticCurveTo(x,y+height,x+radius,y+height)
  ctx.lineTo(x+width-radius,y+height)
  ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius)
  ctx.lineTo(x+width,y+radius)
  ctx.quadraticCurveTo(x+width,y,x+width-radius,y)
  ctx.lineTo(x+radius,y)
  ctx.quadraticCurveTo(x,y,x,y+radius)
  ctx.stroke()
}

/**
 *  参考：https://www.jianshu.com/p/c2b720fa5877 绘制上下居中文字
 * @param {*} ctx
 * @param {*} config
 * @param {*} text 文本
 * @param {*} x
 * @param {*} y
 */
export function drawText (ctx, config, text, x, y) {
  ctx.font = config.font
  ctx.fillStyle = config.fontColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
}

/**
 * 绘制圆形
 * @param {*} ctx
 * @param {*} x
 * @param {*} y
 * @param {*} r
 */
export function drawCircular (ctx, x, y, r, bgColor) {
  ctx.beginPath()
  ctx.fillStyle = bgColor
  ctx.arc(x, y, r, 0, Math.PI*2, true)
  ctx.fill()
  ctx.closePath()
}
