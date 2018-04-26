<template>
<section>
  <div id="wxPay">
    <div class="top-up">
      <span>金额</span><input type="number" disabled=true v-model="totalAmount" placeholder="请输入充值金额">
    </div>
    <div class="pay">
      <img src="../assets/imgs/wx-icon.png" alt="">
      <span>微信支付</span>
    </div>

    <div class="friend">
      <div class="selectd"><span :class="{active:isSelect}" @click='select'></span>给好友充值</div>
      <div class="phone" v-show='isSelect'>
      <label>手机号</label><input @input='phoneKeyUpNub'type="tel" maxlength="11" v-model="phone" placeholder="请输入充值手机号码">
      </div>
      <p>{{msg}}</p>
    </div>
    <div class="rule">
      <div class="rule-note">充值说明</div>
      <ul>
        <li><span>1、</span><p>充值成功后，不可提现</p></li>
        <li><span>2、</span><p>如出现无法充值、充值失败等清空，请联系客服帮你解决问题</p></li>
      </ul>
    </div>
    <div class="btn">
      <button @click="initPayEnv">确认充值</button>
    </div>
  </div>

    <div id="loadingToast" v-show='loading'>
        <div class="weui-mask_transparent"></div>
        <div class="weui-toast">
            <i class="weui-loading weui-icon_toast"></i>
            <p class="weui-toast__content">数据加载中</p>
        </div>
    </div>

    <div id="toast" v-show="pay">
        <div class="weui-mask_transparent"></div>
        <div class="weui-toast">
            <i class="weui-icon-success-no-circle weui-icon_toast"></i>
            <p class="weui-toast__content">充值成功</p>
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
      sessionKey: "",
      openId: localStorage.getItem("wxStore_openId"),
      isSelect: false,
      phone: "",
      totalAmount: "666",
      loading: false,
      message: false,
      content: "",
      flag:-1,//手机号码是否绑定 0 已绑 -1未绑定
      pay: false,
      msg: "",
      wxPay: {
        appId: "", //公众号名称，由商户传入
        timeStamp: "", //时间戳，自1970年以来的秒数
        nonceStr: "", //随机串
        package: "",
        signType: "MD5", //微信签名方式：
        paySign: "" //微信签名
      }
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
    getUserInfo(sessionKey) {
      let url = getDevUrl("/user/query");
      console.log(url);
      axios
        .post(url, { sessionKey })
        .then(res => {
          console.log(res.data.data);
          let data = res.data.data;
          this.openId = data.openId;
        })
        .catch(err => {
          console.log(err);
        });
    },
    //初始化微信支付环境
    initPayEnv() {
      if (typeof WeixinJSBridge == "undefined") {
        if (document.addEventListener) {
          document.addEventListener(
            "WeixinJSBridgeReady",
            this.onBridgeReady,
            false
          );
        } else if (document.attachEvent) {
          document.attachEvent("WeixinJSBridgeReady", this.onBridgeReady);
          document.attachEvent("onWeixinJSBridgeReady", this.onBridgeReady);
        }
      } else {
        this.toPay();
      }
    },
    //微信支付
    toPay() {
      let url = getDevUrl("/wxpay/order");
      if(this.isSelect){
        if(this.flag!=0){
          this.message = true;
          this.content = '请输入已绑定号码';
          setTimeout(()=>{
            this.message = false;
          },2000)
          return ;
        }
      }
      this.loading = true;
      axios
        .post(url, {
          totalAmount: this.totalAmount,
          sessionKey: this.sessionKey,
          openid: this.openid,
          phone: this.phone
        })
        .then(res => {
          this.loading = false;
          console.log(res.data.data);
          if (res.data.code == 0) {
            let data = res.data.data;
            this.wxPay.appId = data.appId; //公众号名称，由商户传入
            this.wxPay.timeStamp = data.timeStamp; //时间戳，自1970年以来的秒数
            this.wxPay.nonceStr = data.nonceStr; //随机串
            this.wxPay.package = data.package;
            this.wxPay.signType = data.signType;
            this.wxPay.paySign = data.sign;
            this.onBridgeReady();
          } else {
          }
        })
        .catch(err => {
          this.loading = false;
          console.log(err);
        });
    },
    onBridgeReady() {
      let wxPayParams = this.wxPay;
      console.log(wxPayParams);
      WeixinJSBridge.invoke("getBrandWCPayRequest", wxPayParams, res => {
        if (res.err_msg == "get_brand_wcpay_request:ok") {
          // this.totalAmount='';
          this.pay = true;
          setTimeout(() => {
            this.pay = false;
          }, 2000);
        }
      });
    },
    checkMoney() {
      let check = /^[+]?(0|([1-9]\d*))(\.\d{0,2})?$/;
      if (check.test(this.totalAmount)) {
      } else {
        this.totalAmount = this.totalAmount.substr(
          0,
          this.totalAmount.length - 1
        );
      }
    },
    select() {
      this.isSelect = !this.isSelect;
      this.phone = "";
      this.msg = '';
    },
    phoneKeyUpNub() {
      this.phone = this.phone.replace(/\D/g, "");
      if (this.phone.length == 11) {
        this.loading = true;
        this.findPhone();
      }
    },
    //检验好友手机是否绑定
    findPhone() {
      let url = getDevUrl("/user/findPhone");
      axios
        .post(url, { phone: this.phone })
        .then(res => {
          console.log(res);
          this.loading = false;
          this.flag = res.data.code;
          if (res.data.code == 0) {
            this.msg='';
          } else {
            this.msg = res.data.msg;
          }
        })
        .catch(err => {
          this.loading = false;
          console.log(err);
        });
    }
  },
  mounted() {
    this.sessionKey = this.getUrlParam("sessionKey");
    // this.getUserInfo(this.sessionKey);
  }
};
</script>

<style lang='scss' scoped>
@import "../assets/mixin.scss";
#wxPay {
  padding-top: ptr(60);
}
.top-up {
  display: flex;
  @include lh(120);
  span {
    flex: 1;
    text-align: center;
    background-color: #fff;
  }
  input {
    flex: 4;
    padding: 0 ptr(20);
    font-size: ptr(40);
    overflow: hidden;
  }
}

.pay {
  padding-left: ptr(100);
  margin-top: ptr(40);
  height: ptr(120);
  background-color: #fff;
  position: relative;
  > img {
    @include patl(40,30);
    @include wh(48,39);
  }
  span {
    display: inline-block;
    @include lh(120);
  }
}
.friend {
  margin-top: ptr(20);
  background-color: #fff;
  font-size: 14px;
  .selectd {
    padding-left: ptr(100);
    @include lh(80);
    position: relative;
    span {
      display: inline-block;
      @include wh(30,30);
      border-radius: 50%;
      border: ptr(1) solid #868585;
      @include patl(23,35);
      &.active {
        background-color: red;
      }
    }
  }
  .phone {
    @include lh(80);
    padding: 0 0 ptr(20) ptr(30);
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
  p{
    padding-left: ptr(120);
    color: red;
  }
}
.rule {
  margin-top: ptr(60);
  padding-left: ptr(30);
  color: #0030ff;
  .rule-note {
    @include lh(80);
    font-size: ptr(32);
    font-weight: 900;
  }
  ul {
    li {
      padding-right: ptr(60);
      font-size: ptr(26);
      display: flex;
      span {
        width: ptr(40);
      }
      p {
        flex: 1;
      }
    }
  }
}
.toast-reast {
  min-height: auto;
  @include lh(100);
}

.btn {
  width: 100%;
  margin-top: ptr(100);
  text-align: center;
  button {
    width: 92%;
    @include lh(100);
    border-radius: ptr(20);
    background-color: #1aad19;
    color: #fff;
    font-size: ptr(40);
    font-weight: 900;
    letter-spacing: 3px;
  }
}
</style>

