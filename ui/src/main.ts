import './assets/scss/index.scss';
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import directives from './directives';
import AdminApp from './views/app/admin.vue';
import SaleApp from './views/app/sale.vue';
import router from './router';
import plugin from './plugin';
import 'element-plus/dist/index.css';

globalThis.router = router;

const app = createApp(isSale ? SaleApp : AdminApp);

app.use(router);
app.use(ElementPlus);
app.use(plugin);
directives(app);

app.mount('#app');
