export const debounce = (fn, ms = 200, immediatelyFun = null) => {
  let timer = null
  return function (...rest) {
    immediatelyFun && immediatelyFun.apply(this, rest)
    clearTimeout(timer)
    timer = setTimeout(() => {
      // 此处需要绑定 this，临时取消 eslint 检查 this
      // eslint-disable-next-line no-invalid-this
      fn.apply(this, rest)
    }, ms)
  }
}