import Vue from 'vue'
import App from './App.vue'
import { router } from './router'

import 'bootstrap/dist/js/bootstrap.bundle.js' // for modal dialogs
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import BootstrapVue from 'bootstrap-vue'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import axios from 'axios'

// code below needed for markers to show on map
// eslint-disable-next-line
delete L.Icon.Default.prototype._getIconUrl  
// eslint-disable-next-line
L.Icon.Default.mergeOptions({  
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})
// end of marker code

axios.defaults.baseURL = 'https://rat.acaciadata.com'
Vue.prototype.$http = axios

Vue.use(BootstrapVue)
Vue.component('v-icon', Icon)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
