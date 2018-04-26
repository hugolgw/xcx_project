/**
 * 配置编译环境和线上环境之间的切换
 * 
 * url: 域名地址
 * http://47.96.141.185:80/config/jssdk
 */

let devUrl = process.env.NODE_ENV == 'development' ? '/dev' : 'http://www.yiaiweiming.com/dev';

export let getDevUrl = function(path) {
  return devUrl + path;
}