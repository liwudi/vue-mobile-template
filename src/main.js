import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false
import Vant from 'vant';
import 'vant/lib/index.css';
import 'vant/lib/icon/local.css';

Vue.use(Vant);

// 全局css
import './styles/common.css';
import './styles/reset.css';

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
