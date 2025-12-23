import type { App } from 'vue';
import enterPress from './enter-press';
import scroll from './scroll';

export default (app: App) => {
  app.directive(enterPress.name, enterPress.directive);
  app.directive(scroll.name, scroll.directive);
};
