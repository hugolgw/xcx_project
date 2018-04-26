<template>
<section>
  <div id="share" v-show='isShow'>
    <img src="../assets/imgs/share-bg.png" alt="">
    <div id="qrcode"><img :src="imgUrl" alt=""></div> 
  </div>

    <div id="loadingToast" v-show='loading'>
        <div class="weui-mask_transparent"></div>
        <div class="weui-toast">
            <i class="weui-loading weui-icon_toast"></i>
            <p class="weui-toast__content">数据加载中</p>
        </div>
    </div>
</section>
</template>

<script>
import { getDevUrl } from "../assets/js/env";
import axios from "axios";
import QRCode from "qrcode";
export default {
  data() {
    return {
      isShow:false,
      sessionKey:'',
      imgUrl: "",
      url : '',
      loading:false,
      wxData: {
        title: "",
        desc: "徒步有益健康你我他，爱她健康传递她！",
        link: "",
        imgUrl: getDevUrl("/static/img/share-icon.png")
      },
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
    //获取用户信息
    getUserInfo(sessionKey, cb) {
      let url = getDevUrl("/user/query");
      this.loading = true;
      console.log(url);
      axios
        .post(url, { sessionKey })
        .then(res => {
          this.loading = false;
          console.log(res.data);
          if (res.data.code == 0) {
            let data = res.data.data;
            this.wxData.title = data.message || "徒步有益，健康你我他";
            this.wxData.link = data.url || getDevUrl("/index.html?sessionKey=");
            this.isShow = true;
            cb && cb();
          } else {
            this.message = true;
            this.content = "网络异常";
            setTimeout(() => {
              this.message = false;
            }, 2000);
          }
        })
        .catch(err => {
          this.loading = false;
          this.message = true;
          this.content = "网络异常";
          setTimeout(() => {
            this.message = false;
          }, 2000);
        });
    },
    //获取sdk配置
    getShareData(sessionKey) {
      let url = getDevUrl("/config/jssdk");
      axios
        .post(url, { sessionKey })
        .then(res => {
          let data = res.data.data;
          let appid = data.appId;
          let timestamp = data.timestamp;
          let nonceStr = data.nonceStr;
          let signature = data.signature;
          this.wxConfig(appid, timestamp, nonceStr, signature);
        })
        .catch(err => {
          console.log(err);
        });
    },
    //微信配置分享
    wxConfig(appid, timestamp, nonceStr, signature) {
      wx.config({
        debug: false, //false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: appid, //data.appId, // 必填，公众号的唯一标识
        timestamp: timestamp, //data.timestamp, // 必填，生成签名的时间戳
        nonceStr: nonceStr, //data.nonceStr, // 必填，生成签名的随机串
        signature: signature, //data.signature, // 必填，签名，见附录1
        jsApiList: [
          "onMenuShareTimeline",
          "onMenuShareAppMessage"
          //"chooseWXPay"
        ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
      });
      wx.ready(() => {
        //分享给朋友
        wx.onMenuShareAppMessage(this.wxData);
        //分享给朋友圈
        wx.onMenuShareTimeline({
          title: this.wxData.title,
          desc: this.wxData.title,
          link: this.wxData.link,
          imgUrl: this.wxData.imgUrl
        });
      });
    },
    qrcode() {
      QRCode.toDataURL(this.url)
        .then(url => {
          this.imgUrl = url;
        })
        .catch(err => {
          console.error(err);
        });
    }
  },
  mounted() {
    this.sessionKey = this.getUrlParam("sessionKey");
    this.getUserInfo(this.sessionKey, () => {
        this.getShareData(this.sessionKey);
      });
    this.url =  getDevUrl("/config/menu/"+this.sessionKey);
    this.qrcode();
  }
};
</script>

<style lang='scss' scoped>
@import "../assets/mixin.scss";
section{
  height: 100%;
}
#share {
  position: relative;
  background-color: #fff;
  height: 100%;
  img {
    width: 100%;
  }
}
#qrcode{
  width: ptr(260);
  position: absolute;
  right: ptr(70);
  top:ptr(440);
  >img{
    display: block;
    width: 100%;
    border-radius: ptr(80);
  }
}
.toast-reast {
  min-height: auto;
  @include lh(100);
}
</style>

