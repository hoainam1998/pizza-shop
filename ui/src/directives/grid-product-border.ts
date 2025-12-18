/**
 * Adding border for product item.
 *
 * @param {HTMLElement} target - The directive binding element.
 */
export default (target: HTMLElement) => {
  for (const el of target.children) {
    const element = el as HTMLElement;
    const currentOffsetTop = element.offsetTop;
    const elementHeight = element.offsetHeight;
    const elementWidth = element.offsetWidth;
    const parentHeight = target.offsetHeight || 0;
    const parentWidth =  target.offsetWidth || 0;
    const currentOffsetLeft = element.offsetLeft;

    if (parentWidth - currentOffsetLeft < elementWidth) {
      element.classList.remove('ps-border-color-right-black', 'ps-border-style-right-dashed');
    } else {
      element.classList.add('ps-border-color-right-black', 'ps-border-style-right-dashed');
    }

    if (parentHeight - elementHeight < currentOffsetTop) {
      element.classList.remove('ps-border-color-bottom-black', 'ps-border-style-bottom-dashed');
    } else {
      element.classList.add('ps-border-color-bottom-black', 'ps-border-style-bottom-dashed');
    }
  }
};
