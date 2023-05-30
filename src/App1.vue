
<template>
  <div id="map-root">
    <MyPopup v-show="popupVisible" :popupData="popupData" />
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
import PopupControl from './popup'
import { onMounted, onUnmounted, reactive, ref, computed, toRaw } from 'vue';
const options = {
  autoOpen: true, // 是否自动打开popup default: true
  emptyClose: true, // 点击空白处自动关闭 default: true
  dragClose: true, // 地图移动时自动隐藏 default: true
  positionType: 'auto', // 'click' | 'geometry' | 'auto' default: auto
  goto: false, // 是否开启view.goto default: false
  transition: 500, // goTo持续时长（毫秒） default: 1000
  goToZoom: () => view.zoom, // default: view.zoom
}

const { view, featureLayer, pointGraphicLayer } = useMap()
const popupData = ref({left: 0, top: 0, graphic: {}})
const popupVisible = ref(false)
const pc = new PopupControl({view, beforeOpen: (data) => {
  console.log(data.left)
  popupData.value = data
  popupVisible.value = true
}, beforeClose: () => {
  console.log(popupVisible.value)
  popupVisible.value = false
}, visible: popupVisible, includeLayers: [featureLayer, pointGraphicLayer], ...options })


onMounted(() => {
  view.container = document.querySelector('#map-root')
})
onUnmounted(() => {
  pc.destroy()
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
