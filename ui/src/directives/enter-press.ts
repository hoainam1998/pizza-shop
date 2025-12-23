import DirectiveBase from './base';

export default new (class implements DirectiveBase {
  name: string = 'enter-press';
  directive = {
    mounted: (el: HTMLElement, binding: any) => {
      el.addEventListener('keydown', (event) => {
        if (event.code === 'Enter') {
          if (typeof binding.value === 'function') {
            binding.value();
          }
        }
      });
    },
  };
})();
