<template>
<section>
  <div v-if='isShow'>
      <div class="phone" >
      <label>手机号</label><input @input='phoneKeyUpNub'type="tel" maxlength="11" v-model="phone" placeholder="请输入手机号码">
      </div>
      <p class="notes">绑定手机号，你的朋友可以通过手机号为你充值</p>
    <div class="btn">
      <button :class="{active:sure}" @click="bindPhone">绑定</button>
    </div>
  </div>
  <div v-else>
    <div class="bg"><img src="./../assets/imgs/phone.png" alt=""></div>
    <p class="num">绑定的手机号：{{phone}}</p>
    <div class="change">
      <button @click="hasPhone">更换手机号</button>
    </div>
  </div>

    <div id="loadingToast" v-show='loading'>
        <div class="weui-mask_transparent"></div>
        <div class="weui-toast">
            <i class="weui-loading weui-icon_toast"></i>
            <p class="weui-toast__content">数据加载中</p>
        </div>
    </div>

    <div id="toast" v-show='message'>
        <div class="weui-mask_transparent"></div>
        <div class="weui-toast toast-reast">
            <p class="weui-toast__content">{{content}}</p>
        </div>
    </div>

</section>
</template>

<script>
import { getDevUrl } from "../assets/js/env";
import axios from "axios";
export default {
  data() {
    return {
      isShow: true,
      sure:false,
      sessionKey:'',
      phone: "",
      loading: false,
      message: false,
      content: "",
    };
  },
  methods: {
    //获取URL里参数
    getUrlParam(name, noDecode, url) {
      let re = new RegExp("[?#&]" + name + "=([^&#]*)", "i");
      let _url = url || window.location.href;
      let m = re.exec(_url);
      let ret = m ? m[1] : "";
      ret = ret.replace(/[+]/gi, "%20");
      return !noDecode ? decodeURIComponent(ret) : ret;
    },
    phoneKeyUpNub() {
      this.phone = this.phone.replace(/\D/g, "");
      this.sure = false;
      if (this.phone.length == 11) {
        this.sure = true;
      }
    },
    //绑定手机号
    bindPhone() {
      let url = getDevUrl("/user/bindPhone");
      if(!this.sure)return;
      this.loading = true;
      axios
        .post(url, { phone: this.phone ,sessionKey:this.sessionKey})
        .then(res => {
          console.log(res);
          this.loading = false;
          if (res.data.code == 0) {
            this.isShow = false;
          } else {
            this.message = true ;
            this.content = res.data.msg;
            setTimeout(()=>{
            this.message = false ;
            },2000)
          }
        })
        .catch(err => {
          this.loading = false;
          console.log(err);
        });
    },
    hasPhone(){
      this.isShow = true;
    }
  },
  mounted() {
    this.sessionKey = this.getUrlParam("sessionKey");
  }
};
</script>

<style lang='scss' scoped>
@import "../assets/mixin.scss";
.phone {
  margin-top: ptr(30);
  @include lh(80);
  padding: ptr(20) 0 ptr(20) ptr(30);
  background-color: #fff;
  label {
    font-size: 14px;
  }
  input {
    margin-left: ptr(20);
    border: 1px solid #eee;
    width: ptr(500);
    height: ptr(80);
    font-size: 14px;
    padding-left: 10px;
  }
}
.bg {
  text-align: center;
  padding-top: 40px;
  img {
    @include wh(300,300);
  }
}
.num {
  @include lh(200);
  text-align: center;
}
.toast-reast {
  min-height: auto;
  @include lh(100);
}
.notes {
  font-size: 14px;
  padding-left: ptr(30);
  @include lh(100);
  color: #646262;
}

.btn,.change {
  width: 100%;
  margin-top: ptr(100);
  text-align: center;
  button {
    width: 92%;
    @include lh(100);
    border-radius: ptr(20);
    background-color: #578857;
    color: #fff;
    font-size: ptr(40);
    font-weight: 900;
    letter-spacing: 3px;
    &.active{
    background-color: #1aad19;
    }
  }
}
.change{
  margin-top: ptr(0);
  button{
  background-color: #d2d3d2;
  color: #333;
  }
}
</style>r

