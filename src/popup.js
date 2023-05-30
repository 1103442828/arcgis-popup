import { debounce } from './utils'
class PopupControl {
  options = {
    includeLayers: [], // 包含点击检测的图层数组
    autoOpen: true,// 是否自动打开popup default: true
    emptyClose: false, // 点击空白处自动关闭 default: true
    dragClose: true, // 地图移动时自动隐藏 default: true
    positionType: 'auto', // 'click' | 'geometry' | 'auto' default: auto
    goto: false, // 是否开启view.goto default: false
    transition: 500, // goTo持续时长（毫秒） default: 1000
    goToZoom: () => this.view.zoom, // default: view.zoom
  }
  view // MapView 对象
  #clickPointCache = undefined
  #isOpen = false
  #viewOnClick
  #viewWatchCenter
  #beforeClose
  #beforeOpen
  popupData = {
    left: 0,
    top: 0,
    selectGraphic: undefined
  }

  constructor({
    view,
    beforeOpen,
    beforeClose,
    ...rest
  }) {
    if (!view) {
      throw new Error('view无效')
    }
    this.view = view
    this.#beforeOpen = beforeOpen
    this.#beforeClose = beforeClose
    this.options = { ...this.options, ...rest}
    this.#registerMonitoring()
  }

  /**
   * 注册监听
   */
  #registerMonitoring = () => {
    this.#viewOnClick = this.view.on('click', this.#onMapClick)
    this.#viewWatchCenter = this.view.watch('center',
      debounce(() => {
        this.#clickPointCache && this.#updatePopup(this.#clickPointCache)
      }, this.options.transition, () => {
        if (this.options.dragClose) {
          this.#isOpen === false
        } else {
          this.#clickPointCache && this.#updatePopup(this.#clickPointCache)
        }
      })
    )
  }
  /**
   * 销毁
   */
  destroy = () => {
    this.popupData.selectGraphic = undefined
    this.#isOpen = false
    this.#viewWatchCenter.remove()
    this.#viewOnClick.remove()

  }

  /**
 * 地图点击处理
 * @param e
 */
  #onMapClick = (e) => {
  // include: 在包含的图层内做碰撞检查
  this.view.hitTest(e, { include: this.options.includeLayers }).then(({ results }) => {
    if (results?.length) {
      const { graphic, graphic: { geometry, attributes } } = results[0] // 如果用重叠要素的话可能有多个返回，咱只拿第一个
      let coordinate = undefined
      switch (this.options.positionType) {
        case 'auto':
          coordinate = geometry.type === 'point' ? geometry : e.mapPoint
          break;
        case 'click':
          coordinate = e.mapPoint
          break;
        default:
          coordinate = geometry
          break;
      }
      this.popupData.selectGraphic = attributes
      const toZoom = typeof this.options.goToZoom === 'function' ? this.options.goToZoom() : this.options.goToZoom
      this.options.goto ? this.#goToGraphic(graphic, toZoom, this.options.transition).then(() => {
        this.#updatePopup(coordinate)
      }) : this.#updatePopup(coordinate)
    } else {
      this.options.emptyClose && this.close()
    }
  })
}

  /**
   * popup显示与更新
   * @param graphic
   */
  #updatePopup = (coordinate) => {
    const point = this.view.toScreen(coordinate) // 坐标转屏幕像素
    this.popupData.left = point.x
    this.popupData.top = point.y
    this.#clickPointCache = coordinate
    this.options.autoOpen && this.open()
  }
  /**
   * 关闭弹窗
   */
  close = () => {
    typeof this.#beforeClose === 'function' && this.#beforeClose(this.popupData)
    this.#clickPointCache = undefined
    this.popupData.selectGraphic = undefined
  }

  /**
   * 打开弹窗
   */
  open = () => {
    console.log(111, typeof this.#beforeOpen)
    typeof this.#beforeOpen === 'function' && this.#beforeOpen(this.popupData)
    this.#isOpen = true
  }

  /**
   * 移动至某个要素
   * @param { Graphic | Graphics } graphics
   * @param { Number } zoom 缩放层级
   * @param { Number } duration 过渡时间
   * @returns Promise
   */
  #goToGraphic = (graphics, zoom, duration) => {
    return this.view.goTo({ zoom, target: graphics }, { duration })
  }

}

export default PopupControl
