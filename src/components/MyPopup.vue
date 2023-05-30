<template>
  <div class="popover-container" :style="{ '--left': props.popupData.left + 'px', '--top': props.popupData.top + 'px' }">
    <div class="name g-ellipsis">内容：{{ props.popupData.attributes }}</div>
  </div>
</template>
<script setup lang="js">
const props = defineProps({
  popupData: {
    type: Object,
    default: () => ({}),
  },
  left: {
    type: Number,
    default: 0,
  },
  top: {
    type: Number,
    default: 0,
  },
})
</script>
<script lang="js">
export default {
  name: 'MyPopup',
}
</script>
<style scoped>
.popover-container {
  position: absolute;
  top: var(--top);
  left: var(--left);
  font-size: 15px;
  background: #feffff;
  box-shadow: 0 3px 3px 1px rgb(0 0 0 / 12%);
  border-radius: 2px;
  opacity: 1;
  transform: translate(-50%, calc(-100% - 10px));
  background-color: #fff;  
}
.name {
  padding: 8px 14px;
  max-width: 50vw;
}
.popover-container::before {
  content: '';
  width: 10px;
  height: 10px;
  position: absolute;
  bottom: 0;
  left: 50%;
  background-color: #fff;
  transform: translate(-50%, 50%) rotate(45deg);
  border-right: 0;
  border-bottom: 0;
  box-shadow: 3px 3px 3px -3px rgb(0 0 0 / 12%);
}
</style>
