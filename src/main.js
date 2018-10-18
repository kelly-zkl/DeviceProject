// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
//ionicons

import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import ElementUI from "element-ui";
import axios from "axios";
import VueAxios from "vue-axios";
import VueClipboard from 'vue-clipboard2';//剪切板

import './assets/css/element-variables.scss'
import "./assets/css/font-awesome.min.css";
// import 'element-ui/lib/theme-chalk/index.css';

import "./common/js/util.js";
import 'babel-polyfill';
import './assets/css/el-custom.css'

let md5 = require("crypto-js/md5");

axios.defaults.withCredentials = true;
Vue.config.productionTip = true;

axios.get("serverconfig.json").then((result) => {
  localStorage.setItem("ApiUrl", result.data.ApiUrl);
  localStorage.setItem("UserUrl", result.data.UserUrl);
  localStorage.setItem("faceUrl", result.data.faceUrl);

  let user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    sessionStorage.setItem("user", JSON.stringify(result.data.user));
  }

  Vue.prototype.$User_Url = result.data.UserUrl;
  axios.defaults.baseURL = result.data.ApiUrl;
  Vue.prototype.faceUrl = result.data.faceUrl;
}).catch((error) => {
  window.console.log(error)
});
Vue.prototype.faceUrl = localStorage.getItem("faceUrl");
axios.defaults.baseURL = localStorage.getItem("ApiUrl");
Vue.prototype.$User_Url = localStorage.getItem("UserUrl");

// Vue.prototype.faceUrl = "http://192.168.31.245/";

// axios.defaults.baseURL = "http://119.147.36.2:58080/CriminalCode-admin-web/";
// axios.defaults.baseURL = "http://120.77.155.12:49191/CriminalCode-admin-web";
// axios.defaults.baseURL = "http://192.168.31.242:19191/CriminalCode-admin-web";
// axios.defaults.baseURL = "http://192.168.31.30:8080/CriminalCode-admin-web";
// axios.defaults.baseURL = "http://119.23.232.135:19191/CriminalCode-admin-web";
// axios.defaults.baseURL = "http://211.95.45.250:29090/CriminalCode-admin-web";
// axios.defaults.baseURL = "http://172.16.128.30:29090/CriminalCode-admin-web/";

// Vue.prototype.$User_Url = "http://120.77.155.12:49191/manager-api";
// Vue.prototype.$User_Url = "http://192.168.31.58:8090/manager-api";
// Vue.prototype.$User_Url = "http://192.168.31.242:19191/manager-api";
// Vue.prototype.$User_Url = "http://119.23.232.135:19191/manager-api";
// Vue.prototype.$User_Url = "http://192.168.31.30:8080/manager-api";

Vue.use(VueClipboard);//剪切板功能

Vue.prototype.$post = function (path, param, successMsg, failMsg, isLogin) {
  let config;
  if (sessionStorage.getItem("user")) {
    let userId = JSON.parse(sessionStorage.getItem("user")).userId;
    if (userId) {
      if (!param) {
        param = {}
      }
      let stringify = JSON.stringify(param);
      let token = md5(stringify + userId + "key-hz-20180123").toString();
      config = {headers: {token: token, tokenId: userId}};
    }
  }

  if (path.indexOf('/manager/') === 0) {
    path = Vue.prototype.$User_Url + path;
  }

  return axios.post(path, param, config).then((res) => {
    let data = res.data;
    if ("000000" === data.code) {
      if (successMsg !== undefined) {
        this.$message({message: successMsg, type: 'success'});
      }
      if (data === undefined) {
        data = {};
      }
      return data;
    } else {
      if (isLogin !== undefined) {
        return data;
      }
    }
    if (failMsg !== undefined) {
      return Promise.reject(failMsg);
    }

    return Promise.reject(data.msg);
  }).catch((err) => {
    if (err == "Error: Network Error") {
      vue.$message.error("服务器开小差了，请重试");
    } else if (err == "Check Code incorret.") {
      vue.$message.error("验证码错误");
    } else {
      vue.$message.error(err);
    }
  });
};

Vue.use(VueAxios, axios);

router.beforeEach((to, from, next) => {
  let user = JSON.parse(sessionStorage.getItem('user'));

  if (!!to.query && to.query.type === "face") {//人脸识别项目调用此项目的页面
    if ((to.path === '/deviceList' || to.path === '/terminalList' || to.path === '/collisionAnalysis' ||
      to.path === '/caseList' || to.path === '/followList')) {//只开放设备列表、imsi列表、碰撞、案件、伴随 5个页面
      if (!user) {
        let user = {groupId: "1", userId: "5a44928633bbd029002fc3fa", account: "superAdmin"};
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      sessionStorage.setItem("link", "yes");
      next();
    } else {//其他页面带url有type字段
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("link");
      if (to.path === '/login' && from !== '/login' && user) {//登录后不能返回到登录页
        return;
      }
      if (!user && to.path !== '/login') {
        next({path: '/login'})
      } else {
        next()
      }
    }
  } else {//平台项目
    if (to.path === '/login' && from !== '/login' && user) {//登录后不能返回到登录页
      return;
    }
    if (!user && to.path !== '/login') {
      next({path: '/login'})
    } else {
      next()
    }
  }
});
Vue.use(ElementUI);
const vue = new Vue({el: '#app', router, template: '<App/>', components: {App}});
