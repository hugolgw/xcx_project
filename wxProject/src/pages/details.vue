<template>
<section>
  <div id="details">
    <div class="no-detail" v-show="detailsBg">
      <img src="../assets/imgs/details.png" alt="">
      <p>暂时没有记录</p>
    </div>
    <div class="details" v-show="detailsContent">
      <ul>
        <li v-for="(item,index) in details" :key='index'>
          <div>
            <p>{{item.payType==1?'充值--':'提现--'}}{{item.payResult==0 ?item.payType==1?'待支付':'提现中':item.payResult==1 ? '成功' : item.payResult==2 ? '失败' :''}}</p>
            <p>{{item.endTime | formatTime}}</p>
          </div>
          <div>{{item.payType==1?'+':'-'}}{{item.amount}}</div>
        </li>
      </ul>
      <div class="btn" @click='getMoreDetails'>{{more}}</div>
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
            <p class="weui-toast__content">网络异常</p>
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
      // openId: localStorage.getItem("wxStore_openId"),
      detailsBg: false,
      detailsContent: false,
      loading: false,
      message: false,
      submit: {
        payType: "", //1充值，2提现
        size: 20,
        page: 1,
        sessionKey: ""
      },
      details: [],
      totalPage: "",
      more: "没有更多了"
    };
  },
  filters: {
    formatTime(val) {
      if(!val) return '';
      return `${val.substr(0, 10)}  ${val.substr(11, 5)}`;
    }
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
    //提现记录查询
    getDetailsInfo() {
      let url = getDevUrl("/order/queryPage");
      this.loading = true;
      axios
        .post(url, this.submit)
        .then(res => {
          this.loading = false;
          if (res.data.code == 0) {
            if (res.data.data.totalRecord > 0) {
              this.detailsBg = false;
              this.detailsContent = true;
            } else {
              this.detailsBg = true;
              this.detailsContent = false;
            }
            this.details = [...this.details, ...res.data.data.list];
            this.totalPage = res.data.data.totalPage;
            this.more =
              this.submit.page >= this.totalPage ? "没有更多了" : "加载更多";
          } else {
            this.message = true;
            setTimeout(() => {
              this.message = false;
            }, 2000);
          }
        })
        .catch(err => {
          this.loading = false;
          this.message = true;
          setTimeout(() => {
            this.message = false;
          }, 2000);
          console.log(err);
        });
    },
    getMoreDetails() {
      if (this.more == "没有更多了") return false;
      this.submit.page += 1;
      this.getDetailsInfo();
    }
  },
  mounted() {
    this.submit.sessionKey = this.getUrlParam("sessionKey");
    this.getDetailsInfo();
  }
};
</script>

<style lang='scss' scoped>
@import "../assets/mixin.scss";
.no-detail {
  padding-top: ptr(100);
  text-align: center;
  img {
    width: ptr(200);
  }
  p {
    color: #333;
  }
}
.details {
  ul {
    padding: 0 10px 10px;
    li {
      width: 100%;
      display: flex;
      border-bottom: 1px solid #d9d9d9;
      div {
        flex: 1;
      }
      div:nth-child(1) {
        p {
          @include lh(80);
        }
      }
      div:nth-child(2) {
        padding-right: 10px;
        padding-top: 20px;
        text-align: right;
      }
    }
  }
  .btn {
    display: block;
    @include lh(100);
    border-bottom: 0px solid transparent;
    background-color: #ddd;
    text-align: center;
  }
}
.toast-reast {
  min-height: auto;
  @include lh(100);
}
</style>

