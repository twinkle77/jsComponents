const clearCanvas = (ctx, w, h) => {
  ctx.beginPath()
  ctx.clearRect(0, 0, w, h)
  ctx.closePath()
}

export default clearCanvas
