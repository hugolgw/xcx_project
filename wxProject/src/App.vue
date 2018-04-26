<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: 'App',
  data(){
    return{
    }
  },
  components: {
  }
}
</script>

<style lang='scss'>
@import './assets/base.scss';
@import "./assets/mixin.scss";
#app{
  font-size: ptr(36);
  height: 100%;
}
</style>
