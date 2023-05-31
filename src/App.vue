
<template>
  <div id="map-root">
    <MyPopup v-show="popupVisible" :popupData="popupData"/>
  </div>
</template>

<script setup>
import MyPopup from './components/MyPopup.vue'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import Graphic from '@arcgis/core/Graphic'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import { onMounted, onUnmounted, reactive, ref} from 'vue';
import PopupControl from 'arcgis-popup-control'



const { view, featureLayer, pointGraphicLayer } = useMap()
const popupData = reactive({left: 0, top: 0, attributes: {}})
const popupVisible = ref(false)


// PopupControl 的部分配置参数
const options = {
  view, // 强制性必填
  include: [featureLayer, pointGraphicLayer],
  emptyClose: true, // 点击空白处自动关闭 default: true
  dragCloseType: 'hide', // 地图移动时自动隐藏 'close' | 'hide' | 'never'  default: hide
  positionType: 'geometry', // 'click' | 'geometry' default: geometry
  goto: true, // 是否开启view.goto default: false
  goToZoom: 15,
  open: ({ left, top, attributes}) => { // open的回调返回 { left: 100, top: 100, attributes: {} } 结构的对象
    popupData.left = left
    popupData.top = top
    popupData.attributes = attributes
    popupVisible.value = true
  },
  close: () => popupVisible.value = false
}


// 创建 PopupControl
const popupControl = new PopupControl(options)


onMounted(() => {
  view.container = document.querySelector('#map-root')
})

onUnmounted(() => {
  popupControl.destroy()
})

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


</script>
<style scoped>
#map-root {
  width: 100vw;
  height: 100vh;
}
</style>
