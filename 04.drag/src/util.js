export const util = {
  hasClass (el, className) {
    return el.classList.contains(className)
  },
  addClass (el, className) {
    if (util.hasClass(el, className)) return
    el.classList.add(className)
  },
  removeClass (el, className) {
    if (!util.hasClass(el, className)) return
    el.classList.remove(className)
  },
  toggleClass (el, className) {
    el.classList.toggle(className)
  },
  // https://segmentfault.com/q/1010000010326265
  swapElements (a,b) {
    if(a==b)return;
    //记录父元素
    var bp=b.parentNode,ap=a.parentNode;
    //记录下一个同级元素
    var an=a.nextElementSibling,bn=b.nextElementSibling;
    //如果参照物是邻近元素则直接调整位置
    if(an==b)return bp.insertBefore(b,a);
    if(bn==a)return ap.insertBefore(a,b);
    if(a.contains(b)) //如果a包含了b
      return ap.insertBefore(b,a),bp.insertBefore(a,bn);
    else
      return bp.insertBefore(a,b),ap.insertBefore(b,an);
  }
}
