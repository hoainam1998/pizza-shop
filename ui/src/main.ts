import './assets/scss/index.scss';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import plugin from './plugin';
import 'element-plus/dist/index.css';

globalThis.router = router;

const app = createApp(App);

app.use(router);
app.use(ElementPlus);
app.use(plugin);

app.mount('#app');
