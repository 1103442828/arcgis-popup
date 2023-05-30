
<template>
  <div id="map-root">
    <MyPopup v-show="isOpen  && clickPointCache" :graphic="selectGraphic" :left="popupData.left" :top="popupData.top" />
  </div>
</template>

<script setup>
import { debounce } from './utils'
import MyPopup from './components/MyPopup.vue'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import Graphic from '@arcgis/core/Graphic'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'

import { onMounted, onUnmounted, reactive, ref, computed, toRaw } from 'vue';
const options = {
  autoOpen: true, // 是否自动打开popup default: true
  emptyClose: false, // 点击空白处自动关闭 default: true
  dragClose: true, // 地图移动时自动隐藏 default: true
  positionType: 'auto', // 'click' | 'geometry' | 'auto' default: auto
  goto: false, // 是否开启view.goto default: false
  transition: 500, // goTo持续时长（毫秒） default: 1000
  goToZoom: () => view.zoom, // default: view.zoom
}
const clickPointCache = ref(undefined)
const isOpen = ref(false)
const selectGraphic = ref(undefined)
const popupData = reactive({
  text: '',
  left: 0,
  top: 0,
})
const { map, view, featureLayer, pointGraphicLayer } = useMap()

const viewOnClick = view.on('click', onMapClick)
const viewWatchCenter = view.watch(
  'center',
  debounce(() => {
    clickPointCache.value && updatePopup(toRaw(clickPointCache.value))
  }, options.transition, () => {
    if (options.dragClose) {
      isOpen.value === false
    } else {
      clickPointCache.value && updatePopup(toRaw(clickPointCache.value))
    }
  })
)

onMounted(() => {
  view.container = document.querySelector('#map-root')
})
onUnmounted(() => {
  viewWatchCenter.remove()
  viewOnClick.remove()
})

/**
 * 地图点击监听
 * @param e
 */
function onMapClick(e) {
  options.emptyClose && close()
  // include: 在包含的图层内做碰撞检查
  view.hitTest(e, { include: [featureLayer, pointGraphicLayer] }).then(({ results, screenPoint }) => {
    if (results?.length) {
      const { graphic, graphic: { geometry } } = results[0] // 如果用重叠要素的话可能有多个返回，咱只拿第一个
      let coordinate = undefined
      switch (options.positionType) {
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
      selectGraphic.value = graphic
      const toZoom = typeof options.goToZoom === 'function' ? options.goToZoom() : options.goToZoom
      options.goto ? goToGraphic(graphic, toZoom, options.transition).then(() => {
        updatePopup(coordinate)
      }) : updatePopup(coordinate)
    }
  })
}


/**
 * popup显示与更新
 * @param graphic
 */
function updatePopup(coordinate) {
  const point = view.toScreen(coordinate) // 坐标转屏幕像素
  popupData.left = point.x
  popupData.top = point.y
  clickPointCache.value = coordinate
  options.autoOpen && open()
}

/**
 * 关闭弹窗
 */
function close() {
  clickPointCache.value = undefined
  selectGraphic.value = undefined
}

/**
 * 关闭弹窗
 */
function open() {
  isOpen.value = true
}

/**
 * 初始化map
 */
function useMap() {
  const map = new Map({
    basemap: "gray-vector"
  });
  const view = new MapView({
    map: map,
    center: [-117.08, 34.1],
    zoom: 11
  });
  const pointGraphicLayer = new GraphicsLayer({ id: 'pointGraphicLayer' })
  const featureLayer = new FeatureLayer({ url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/TrailRuns/FeatureServer/0" });

  const pointGraphic = new Graphic({
    geometry: {
      type: "point",
      longitude: -117.06699371162897,
      latitude: 34.10807366197611,
    },
    attributes: { name: '引力波' },
    symbol: {
      type: "simple-marker",
      color: [226, 119, 40],
    }
  });
  pointGraphicLayer.add(pointGraphic)
  map.addMany([pointGraphicLayer, featureLayer]);
  return { map, view, featureLayer, pointGraphicLayer }
}

/**
 * 移动至某个要素
 * @param { Graphic | Graphics } graphics
 * @param { Number } zoom 缩放层级
 * @param { Number } duration 过渡时间
 * @returns Promise
 */
function goToGraphic(graphics, zoom = 17, duration = 1700) {
  return view.goTo({ zoom, target: graphics }, { duration })
}

</script>
<style scoped>
#map-root {
  width: 100vw;
  height: 100vh;
}
</style>
