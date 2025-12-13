import type { App } from 'vue';
import enterPress from './enter-press';

export default (app: App) => {
  app.directive(enterPress.name, enterPress.dir);
};
