import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/normalize.css'
import './assets/css/global.css'
import './plugins/element'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import ZkTable from 'vue-table-with-tree-grid'

Vue.use(ZkTable)
Vue.prototype.$ajax = axios 
//配置请求更路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

axios.interceptors.request.use(config =>{
  console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.config.productionTip = false
new Vue({
  router,
  render: function (h) { return h(App) },
}).$mount('#app')
