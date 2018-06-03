const calcNode = (ctx, config, txt, pos) => {
  const { padding, font, fontColor, radius } = config

  ctx.font = font
  let txtWidth = ctx.measureText(txt).width

  let rectWidth = txtWidth + 2 * padding
  let rectHeight = parseInt(font) + 2 * padding

  // 绘制矩形
  let rectX = pos.x
  let rectY = pos.y
  if (pos.center === true) {
    rectX = pos.x - rectWidth / 2
    rectY = pos.y - rectHeight / 2
  }
  // drawRect(ctx, rectX, rectY, rectWidth, rectHeight, radius)

  // 绘制文字
  // let txtX = rectX + rectWidth / 2
  // let txtY = rectY + rectHeight / 2

  // drawText(ctx, config, txt, txtX, txtY)

  return {
    rectWidth,
    rectHeight,
    centerX: rectX + rectWidth / 2,
    centerY: rectY + rectHeight / 2
  }
}

export default calcNode
