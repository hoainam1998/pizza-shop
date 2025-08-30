import './assets/scss/index.scss';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

globalThis.isSale = process.env.APP_NAME === 'sale';

const app = createApp(App);

app.use(router);
app.use(ElementPlus);

app.mount('#app');
