<template>
<section>
  <div id="index" v-show="isShow">
    <div class="banner">
      <img src="../assets/imgs/banner.jpg">
      <div class="user">
        <img :src="userImg" alt="">
        <div class="name">{{userName}}</div>
        <p><p/>
      </div>
      <a href="https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzU5NzUwNTk4Mw==#wechat_redirect" v-show="subscribe" >关注</a>
    </div>
    <div class="info">
      <ul>
        <li><p>{{balance}}</p><P>提现余额</P></li>
        <!-- <li><p>{{cashBack}}</p><P>累计奖励</P></li> -->
        <li><p>{{stepNumber}}</p><P>今日步数</P></li>
        <li><p>{{cashShare}}</p><P>分享奖励</P></li>
      </ul>
    </div>
    <div class="main">
      <div class="title">{{title}}</div>
      <ul>
        <li class="menu_title" @click="toPage('/wxPay')"><img src="../assets/imgs/gold.png" alt="">充值<i class="iconfont icon-jiantou"></i></li>
        <li class="menu_title" @click="toPage('/withdrawal')"><img src="../assets/imgs/money.png" alt="">申请提现<i class="iconfont icon-jiantou"></i></li>
        <li class="menu_title" @click="toPage('/share')"><img src="../assets/imgs/share.png" alt="">爱分享<i class="iconfont icon-jiantou"></i></li>
        <li class="menu_title" @click="toPage('/phone')"><img src="../assets/imgs/phone.png" alt="">绑定手机<i class="iconfont icon-jiantou"></i></li>
      </ul>
    </div>
    <div class="qiandao"><span :class="{'qiandao-btn':isQiandao}" @click="getShareInfo">{{qiandao}}</span></div>
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

    <div class="js_dialog" id="iosDialog2" v-show='msg'>
      <div class="weui-mask"></div>
        <div class="weui-dialog">
          <div class="weui-dialog__bd">{{info}}</div>
          <div class="weui-dialog__ft">
              <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" @click='close'>好</a>
          </div>
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
      wxData: {
        title: "",
        desc: "徒步有益健康你我他，爱她健康传递她！",
        link: "",
        imgUrl: getDevUrl("/static/img/share-icon.png")
      },
      subscribe: true,
      loading: false,
      message: false,
      msg: false,
      isShow: false,
      isQiandao: true,
      info: "",
      content: "",
      qiandao: "点击签到",
      userName: "爱之名",
      userImg: "",
      openId: "",
      sessionKey: "",
      id: "",
      source: "", //推荐人标识
      balance: "", //用户余额
      oldMember: "", //是否会员 0否 1是
      stepNumber: "", //步数
      cashBack: "", //累计奖励
      cashShare: "", //分享奖励
      createTime: "", //创建时间
      grade: "", //会员等级
      isSign: 0, //0没有 1签到
      title: "理财中心"
    };
  },
  methods: {
    toPage(url) {
      this.$router.push(url);
    },
    //去关注关注号
    gotoSubscribe() {
      location.href =
        "https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzU5NzUwNTk4Mw==#wechat_redirect";
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
            this.userName = data.name;
            this.userImg = data.imageUrl;
            this.openId = data.openId;
            this.balance = data.balance;
            this.cashBack = data.cashBack;
            this.stepNumber = data.stepNumber;
            this.cashShare = data.cashShare;
            this.wxData.title = data.message || "徒步有益，健康你我他";
            this.wxData.link = data.url || getDevUrl("/index.html?sessionKey=");
            this.isSign = data.isSign;
            this.subscribe = data.subscribe == 0 ? true : false;
            if (this.isSign == 1) {
              this.qiandao = "已签到";
              this.isQiandao = false;
            }
            this.isShow = true;
            localStorage.setItem("wxStore_openId", data.openId);
            localStorage.setItem("wxStore_url", data.url);
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
    // 签到分享
    getShareInfo() {
      if (this.isSign == 1) return false;
      if (this.stepNumber < 5000)
        return (
          (this.msg = true),
          (this.info = `您今日步数不够喔，达到5000步才可以签到，还差${5000 -
            this.stepNumber}步，加油！！！`)
        );
      let url = getDevUrl("/user/shareInfo");
      let sessionKey = this.sessionKey;
      axios
        .post(url, { sessionKey })
        .then(res => {
          if (res.data.code == 0) {
            let data = res.data.data;
            this.isSign = 1;
            this.qiandao = "签到成功";
            this.isQiandao = false;
            this.balance = data.balance;
            this.wxData.title = data.message;
            this.wxData.link = data.url;
            this.message = true;
            this.content = "签到成功";
            setTimeout(() => {
              this.message = false;
            }, 2000);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    close() {
      this.msg = false;
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
    //微信授权
    authorization(url) {
      let appid = "wx9b06c3a33f05ecdf";
      let redirect_uri = encodeURIComponent(url);
      let response_type = "code";
      let scope = "snsapi_userinfo";
      // let state = this.sessionKey;
      let state = "STATE";
      let wechat_redirect = "#wechat_redirect";

      let locationUrl =
        "https://open.weixin.qq.com/connect/oauth2/authorize?" +
        "appid=" +
        appid +
        "&" +
        "redirect_uri=" +
        redirect_uri +
        "&" +
        "response_type=" +
        response_type +
        "&" +
        "scope=" +
        scope +
        "&" +
        "state=" +
        state +
        "&" +
        wechat_redirect;

      window.location.href = locationUrl;
    },
    //获取URL里参数
    getUrlParam(name, noDecode, url) {
      let re = new RegExp("[?#&]" + name + "=([^&#]*)", "i");
      let _url = url || window.location.href;
      let m = re.exec(_url);
      let ret = m ? m[1] : "";
      ret = ret.replace(/[+]/gi, "%20");
      return !noDecode ? decodeURIComponent(ret) : ret;
    }
  },
  mounted() {
    this.sessionKey = this.getUrlParam("sessionKey");
    if (this.sessionKey == "") {
      window.location.href = "http://www.yiaiweiming.com/dev/config/menu/index";
    } else {
      this.getUserInfo(this.sessionKey, () => {
        this.getShareData(this.sessionKey);
      });
    }
  }
};
</script>

<style lang='scss' scoped>
@import "../assets/mixin.scss";
#index {
  font-size: ptr(36);
}
.banner {
  width: 100%;
  position: relative;
  > img {
    display: block;
    width: 100%;
    // height: ptr(360);
  }
  .user {
    @include patl(200,180);
    // @include sc();
    img {
      @include wh(160,160);
      border-radius: 50%;
      background-color: #dcd7d7;
    }
    .name {
      text-align: center;
      font-size: ptr(40);
      font-weight: 900;
      color: #fff;
    }
  }
  > a {
    @include patr(40,30);
    @include lh(60);
    border-radius: ptr(15);
    padding: 0 ptr(20);
    background-color: #1aad19;
    color: #fff;
    font-size: ptr(30);
    font-weight: 600;
    letter-spacing: 2px;
    // img {
    //   width: ptr(48);
    //   vertical-align: middle;
    // }
  }
}
.info {
  background-color: rgba(0, 0, 0, 0.6);
  ul {
    display: flex;
    li {
      flex: 1;
      color: #fff;
    }
    p {
      @include lh(50);
      font-size: ptr(26);
      text-align: center;
    }
    p:nth-child(1) {
      line-height: ptr(60);
      font-weight: 900;
      font-size: ptr(36);
    }
    p:nth-child(2) {
      font-size: ptr(24);
      color: #bfbfbf;
    }
  }
}
.main {
  padding-top: ptr(20);
  background-color: #f3f0f0;
  .title {
    @include lh(80);
    padding-left: ptr(20);
    font-size: ptr(26);
    color: #6d6a6a;
    border-bottom: 1px solid #ddd;
    background-color: #fff;
  }
  .menu_title {
    @include lh(100);
    padding-left: ptr(120);
    border-bottom: 1px solid #ddd;
    background-color: #fff;
    position: relative;
    > img {
      @include patl(10 ,20);
      width: ptr(80);
    }
    i {
      @include patr(0 ,30);
      font-size: ptr(50);
      color: #9c9b9b;
    }
  }
}
.toast-reast {
  min-height: auto;
  @include lh(100);
}
.qiandao {
  margin-top: ptr(20);
  text-align: center;
  span {
    display: inline-block;
    @include wlh(160,160);
    background-color: #1aad19;
    border-radius: 50%;
    font-weight: 900;
    font-size: ptr(30);
    color: #fff;
    box-shadow: 0 0px 20px 0 #8aec8a;
    &.qiandao-btn {
      background-color: red;
      box-shadow: 0 0px 20px 0 #ef5c5c;
      animation: scaleRun 2s 1s ease infinite;
      -webkit-animation: scaleRun 2s 1s ease infinite;
      -moz-animation: scaleRun 2s 1s ease infinite;
    }
  }
}

@keyframes scaleRun {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.8);
  }
}

@-webkit-keyframes scaleRun {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.8);
  }
}
</style>
