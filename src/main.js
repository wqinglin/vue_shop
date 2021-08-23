import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/normalize.css'
import './assets/css/global.css'
import './plugins/element'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import ZkTable from 'vue-table-with-tree-grid'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

//深拷贝
import _  from 'lodash';

Vue.use(VueQuillEditor)
Vue.use(ZkTable)
Vue.prototype.$ajax = axios 
//配置请求更路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

axios.interceptors.request.use(config =>{
  console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
//全局事件过滤器
Vue.filter('momentFormat', originVal => {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false
new Vue({
  router,
  render: function (h) { return h(App) },
}).$mount('#app')
