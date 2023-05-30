import {
  debounce
} from './utils'
class PopupControl {
  options = {
    includeLayers: [], // 包含点击检测的图层数组
    emptyClose: false, // 点击空白处自动关闭 default: true
    dragCloseType: 'never', // 地图移动时自动隐藏 'close' | 'hide' | 'never'  default: never
    positionType: 'geometry', // 'click' | 'geometry' default: geometry
    goto: false, // 是否开启view.goto default: false
    transition: 800, // goTo持续时长（毫秒） default: 800
    goToZoom: () => this.view.zoom, // default: view.zoom
  }
  view // MapView 对象
  #clickPointCache = undefined
  #isOpen = false
  #viewOnClick
  #viewWatchCenter
  #close
  #open
  #doNotClose = false
  #timer = null
  left = 0
  top = 0
  attributes = {}

  constructor({
    view,
    open,
    close,
    ...rest
  }) {
    if (!view) {
      throw new Error('view无效')
    }
    this.view = view
    this.#open = open
    this.#close = close
    this.options = {
      ...this.options,
      ...rest
    }
    this.#registerMonitoring()
  }

  /**
   * 注册监听
   */
  #registerMonitoring = () => {
    this.#viewOnClick = this.view.on('click', this.#onMapClick)
    this.#viewWatchCenter = this.view.watch('center', () => {
      switch (this.options.dragCloseType) {
        case 'close':
          if (!this.#doNotClose) {
            this.#handleClose()
            this.#clear()
          }
          break;
        case 'hide':
          !this.#doNotClose && this.#isOpen && this.#handleClose()
          break;
        default:
          this.#clickPointCache && this.#updatePopup(this.#clickPointCache)
          break;
      }
      if (this.#timer) {
        clearTimeout(this.#timer)
        this.#timer = null
      }
      this.#timer = setTimeout(() => {
        this.#clickPointCache && this.#updatePopup(this.#clickPointCache)
      }, this.options.transition);
    })
    
    // debounce(() => {
    //   this.#clickPointCache && this.#updatePopup(this.#clickPointCache)
    // }, this.options.transition, () => {
    //   switch (this.options.dragCloseType) {
    //     case 'close':
    //       if (!this.#doNotClose) {
    //         this.#handleClose()
    //         this.#clear()
    //       }
    //       break;
    //     case 'hide':
    //       !this.#doNotClose && this.#isOpen && this.#handleClose()
    //       break;
    //     default:
    //       this.#clickPointCache && this.#updatePopup(this.#clickPointCache)
    //       break;
    //   }
    // })
  }
  /**
   * 销毁
   */
  destroy = () => {
    this.#handleClose()
    this.#viewWatchCenter.remove()
    this.#viewOnClick.remove()
    this.#close = null
    this.#open = null
    this.view = null
  }

  /**
   * 地图点击处理
   * @param e
   */
  #onMapClick = (e) => {
    // include: 在包含的图层内做碰撞检查
    this.view.hitTest(e, {
      include: this.options.includeLayers
    }).then(({
      results
    }) => {
      if (results?.length) {
        const {
          graphic,
          graphic: {
            geometry,
            attributes
          }
        } = results[0] // 如果用重叠要素的话可能有多个返回，咱只拿第一个
        this.attributes = attributes

        switch (this.options.positionType) {
          case 'click':
            this.#clickPointCache = e.mapPoint
            break;
          default:
            this.#clickPointCache = geometry.type === 'point' ? geometry : geometry.extent ? geometry.extent.center : e.mapPoint
            break;
        }

        const toZoom = typeof this.options.goToZoom === 'function' ? this.options.goToZoom() : this.options.goToZoom

        if (this.options.goto) {
          this.#handleClose()
          this.#goToGraphic(graphic, toZoom, this.options.transition).then(() => {
            this.#doNotClose = false
            this.#updatePopup(this.#clickPointCache)
          })
        } else {
          this.#updatePopup(this.#clickPointCache)
        }
      } else {

        this.options.emptyClose && this.#handleClose()
        this.options.emptyClose && this.#clear()
      }
    })
  }

  /**
   * popup显示与更新
   * @param graphic
   */
  #updatePopup = (coordinate) => {
    const {x,y} = this.view.toScreen(coordinate) // 坐标转屏幕像素
    this.left = x
    this.top = y
    this.#handleOpen()
  }

  /**
   * 关闭弹窗
   */
  #handleClose() {
   this.#clickPointCache && typeof this.#close === 'function' && this.#close()
   this.#isOpen = false
  }

  /**
   * 打开弹窗
   */
  #handleOpen = () => {
    const { left, top, attributes } = this
    typeof this.#open === 'function' && this.#open({ left, top, attributes })
    this.#isOpen = true
  }

  /**
   * 清除
   */
  #clear() {
    this.#clickPointCache = undefined
  }

  /**
   * 移动至某个要素
   * @param { Graphic | Graphics } graphics
   * @param { Number } zoom 缩放层级
   * @param { Number } duration 过渡时间
   * @returns Promise
   */
  #goToGraphic = (graphics, zoom, duration) => {
    this.#doNotClose = true
    return this.view.goTo({
      zoom,
      target: graphics
    }, {
      duration
    })
  }

}

export default PopupControl