import { drawCircular, drawText } from './drawUtil'

const drawBtn = (ctx, config, text, pos) => {
  const { btnStyle } = config

  // 绘制圆形
  drawCircular(ctx, pos.x, pos.y, btnStyle.radius, btnStyle.backgroundColor)

  // 绘制文字
  drawText(ctx, btnStyle, text, pos.x, pos.y)
}

export default drawBtn
