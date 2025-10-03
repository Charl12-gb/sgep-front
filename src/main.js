import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Helper from '@/mixins/Helper'
// import Bootstrap from '@/mixins/Bootstrap'

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'

// Bootstrap JavaScript (avec Popper.js inclus)
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import $ from 'jquery';
window.$ = $;
window.jQuery = $;

createApp(App)
    .use(store)
    .use(router)
    .mixin(Helper)
    // .mixin(Bootstrap)
    .mount('#app')