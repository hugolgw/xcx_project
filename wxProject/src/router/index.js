import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

import index from '../pages/index.vue'
import withdrawal from '../pages/withdrawal.vue'
import wxPay from '../pages/wxPay.vue'
import details from '../pages/details.vue'
import share from '../pages/share.vue'
import phone from '../pages/phone.vue'

const routes = [
  {
    path: "/",
    component: index
  },{
    path: "/withdrawal",
    component: withdrawal
  },{
    path: "/wxPay",
    component: wxPay
  },{
    path: "/details",
    component: details
  },{
    path: "/share",
    component: share
  },{
    path: "/phone",
    component: phone
  }
];

export default new Router({
  routes
});