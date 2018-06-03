
/**
 * 参考：http://cubic-bezier.com/#.17,.67,.53,.91
 * 控制点的作用：
 * http://www.zhangxinxu.com/wordpress/2013/08/%E8%B4%9D%E5%A1%9E%E5%B0%94%E6%9B%B2%E7%BA%BF-cubic-bezier-css3%E5%8A%A8%E7%94%BB-svg-canvas/
 */
let DIFF = 50

export default (ctx, start, end, config) => {
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)

  let y1 = 0
  let y2 = 0
  if (start.y === end.y) {
    y1 = y2 = end.y
  } else if (start.y > end.y) {
    y1 = start.y - DIFF
    y2 = end.y - DIFF / 2
  } else {
    y1 = start.y + DIFF
    y2 = end.y + DIFF / 2
  }

  ctx.bezierCurveTo(start.x, y1, end.x, y2, end.x, end.y)
  ctx.stroke()
}
