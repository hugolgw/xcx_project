<template>
<section> 
  <div id="withdrawal">
    <div class="detail-box">
      <div class="total">
        <p><i class="iconfont icon-huobi"></i>{{maxAmount}}</p>
        <p>累计提现</p>
      </div>
      <div class="detail"><span @click="toPage('/details')">交易记录</span></div>
    </div>
    <div class="num">
      <p>提现金额：</p>
      <div class="input"><i class="iconfont icon-huobi"></i><input v-model='totalAmount' type="number"></div>
      <div class="notes">最大提现金额为<span class="assets">{{balance}}</span>元，<span class="all" @click="getAllMoney">全部提现</span></div>
    </div>
    <div class="methods">
      <p>提现方式：</p>
      <div class="select">
        <i class="iconfont icon-iconfontjiantou"></i>
        <div class="result">微信钱包</div>
      </div>
    </div>
    <div class="btn">
      <button @click="getWithdrawalso">确认提现</button>
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
            <p class="weui-toast__content">{{info}}</p>
        </div>
    </div>

    <div id="toast" v-show="pay">
        <div class="weui-mask_transparent"></div>
        <div class="weui-toast">
            <i class="weui-icon-success-no-circle weui-icon_toast"></i>
            <p class="weui-toast__content">提现成功</p>
        </div>
    </div>

    <div class="js_dialog" id="iosDialog2" v-show='alert'>
      <div class="weui-mask"></div>
        <div class="weui-dialog">
          <div class="weui-dialog__bd">把这个好消息分享到朋友圈</div>
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
      loading: false,
      message: false,
      pay: false,
      info: "",
      alert:'',
      sessionKey: "",
      totalAmount: "",
      maxAmount: "",//累计返现
      balance:'',//余额
    };
  },
  methods: {
    toPage(url) {
      this.$router.push(url);
    },
    //获取URL里参数
    getUrlParam(name, noDecode, url) {
      let re = new RegExp("[?#&]" + name + "=([^&#]*)", "i");
      let _url = url || window.location.href;
      let m = re.exec(_url);
      let ret = m ? m[1] : "";
      ret = ret.replace(/[+]/gi, "%20");
      return !noDecode ? decodeURIComponent(ret) : ret;
    },
    //累计提现，余额
    getAllCash(sessionKey) {
      let url = getDevUrl("/order/getAllCash");
      console.log(url);
      axios
        .post(url, { sessionKey })
        .then(res => {
          if (res.data.code == 0) {
            let data = res.data.data;
            this.maxAmount = data.money || 0;
            this.balance = data.balance || 0;
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //提现申请
    getWithdrawalso() {
      let url = getDevUrl("/wxpay/withdrawals");
      if (this.totalAmount == '') {
        this.message = true;
        this.info = "请输入金额";
        setTimeout(() => {
          this.message = false;
        }, 2000);
        return false;
      }
      if(this.balance=='0.00'){
        this.message = true;
        this.info = "余额不足";
        setTimeout(() => {
          this.message = false;
        }, 2000);
        return false;
      }
      if (this.totalAmount <= 0) {
        this.message = true;
        this.info = "请输入合法金额";
        setTimeout(() => {
          this.message = false;
        }, 2000);
        return false;
      }
      if (this.totalAmount - this.balance > 0) {
        this.message = true;
        this.info = "超过最大余额";
        setTimeout(() => {
          this.message = false;
        }, 2000);
        return false;
      }
      this.loading = true;
      axios
        .post(url, {
          totalAmount: this.totalAmount,
          sessionKey: this.sessionKey
        })
        .then(res => {
          this.loading = false;
          if (res.data.code == 0) {
            this.pay = true;
            this.getAllCash(this.sessionKey);
            this.totalAmount='';
            setTimeout(() => {
              this.pay = false;
              this.alert=true;
            }, 2000);
          } else {
            this.message = true;
            this.info = "网络异常";
            setTimeout(() => {
              this.message = false;
            }, 2000);
          }
        })
        .catch(err => {
          this.loading = false;
          this.message = true;
          this.info = "网络异常";
          setTimeout(() => {
            this.message = false;
          }, 2000);
          console.log(err);
        });
    },
    getAllMoney() {
      this.totalAmount = this.balance;
    },
    close() {
      this.alert = false;
    },
  },
  mounted() {
    this.sessionKey = this.getUrlParam("sessionKey");
    this.getAllCash(this.sessionKey);
  }
};
</script>

<style lang='scss' scoped>
@import "../assets/mixin.scss";
.detail-box {
  display: flex;
  height: ptr(200);
  background-color: #fff;
  .total {
    flex: 1;
    padding-top: ptr(50);
    p {
      padding-left: ptr(40);
      i {
        font-size: ptr(40);
        font-weight: 900;
      }
    }
    p:nth-child(1) {
      font-size: ptr(40);
    }
    p:nth-child(2) {
      @include lh(50);
      font-size: ptr(30);
    }
  }
  .detail {
    flex: 1;
    text-align: right;
    padding-top: ptr(30);
    padding-right: ptr(50);
    color: #3788ec;
  }
}
.num {
  margin-top: ptr(10);
  background-color: #fff;
  p {
    @include lh(80);
    padding-left: ptr(20);
    color: #9c9b9b;
  }
  .input {
    @include lh(100);
    padding-left: ptr(20);
    font-size: ptr(60);
    display: flex;
    i {
      width: ptr(80);
      font-size: ptr(60);
      font-weight: 900;
      text-align: center;
    }
    input {
      flex: 1;
      @include lh(100);
      font-size: ptr(60);
      font-weight: 900;
      overflow: hidden;
    }
  }
  .notes {
    padding-left: ptr(20);
    border-top: 1px solid #f5f5f5;
    @include lh(80);
    color: #9c9b9b;
    .assets {
      color: red;
    }
    .all {
      color: #3788ec;
    }
  }
}
.methods {
  margin-top: ptr(10);
  padding: 0 ptr(30) ptr(20);
  background-color: #fff;
  p {
    @include lh(80);
    padding-left: ptr(20);
    color: #9c9b9b;
  }
  .select {
    width: 100%;
    padding-top: ptr(30);
    border-top: 1px solid #f5f5f5;
    position: relative;
    i {
      @include lh(80);
      @include patr(30,30);
    }
    .result {
      @include lh(80);
      padding-left: ptr(20);
      border: 1px solid #b5b3b3;
      border-radius: 5px;
    }
  }
}
.btn {
  margin-top: ptr(40);
  text-align: center;
  button {
    width: 92%;
    @include lh(100);
    border-radius: ptr(20);
    //#3788ec
    background-color: #1aad19;
    color: #fff;
    font-size: ptr(40);
    font-weight: 900;
    letter-spacing: 3px;
  }
}

.toast-reast {
  min-height: auto;
  @include lh(100);
}
</style>

