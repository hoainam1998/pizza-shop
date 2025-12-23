import DirectiveBase from './base';

export default new (class implements DirectiveBase {
  name: string = 'scroll';
  directive = {
    mounted: (el: HTMLElement): void => {
      el.setAttribute('data-scroll', 'true');
      window.addEventListener('scroll', () => {
        const matches = document.querySelectorAll('[data-scroll=true]');
        const lastMatch = matches[matches.length - 1];
        if (el == lastMatch) {
          if (window.pageYOffset > 10) {
            el.classList.add('ps-box-shadow-1');
          } else {
            el.classList.remove('ps-box-shadow-1');
          }
        }
      });
    },
  };
})();
