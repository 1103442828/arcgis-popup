<template>
  <div class="popover-container" :style="{ '--left': props.popupData.left + 'px', '--top': props.popupData.top + 'px' }">
    <div class="img-box">
     <img class="left" src="https://images.unsplash.com/photo-1685440210801-d66177b55a06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxM3x8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=60" alt="">
     <div class="right-box">
       <img class="right-img " src="https://images.unsplash.com/photo-1685384525692-45a52ca300a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyMHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=60" alt="">
       <img class="right-img" src="https://images.unsplash.com/photo-1685401522160-bc0050fef58a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyMnx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=60" alt="">
      </div>
    </div>
    <div class="name g-ellipsis">attributes：{{ props.popupData.attributes }}</div>
  </div>
</template>
<script setup lang="js">
const props = defineProps({
  popupData: {
    type: Object,
    default: () => ({}),
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
.img-box {
  padding: 10px;
  max-width: 300px;
  max-height: 300px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: stretch;
}
img {
  border-radius: 4px;
}
.left {
  flex-basis: 45%;
}
.right-box {
  margin-left: 10px;
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  align-items: stretch;
}
.right-img {
  flex: 1;
}
.right-img:nth-child(n + 2) {
  margin-top: 10px;
}
.name {
  padding: 8px 14px;
  max-width: 50vw;
}
</style>
