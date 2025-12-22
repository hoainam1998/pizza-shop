/**
 * Adding style when scroll.
 *
 * @param {HTMLElement} el - The target element.
 */
const vScroll = (el: HTMLElement): void => {
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 10) {
      el.classList.add('ps-box-shadow-1');
    } else {
      el.classList.remove('ps-box-shadow-1');
    }
  });
};

export default vScroll;
