import { primaryColor } from '@/assets/scss/variables.module.scss';

/**
 * Highlight selected category.
 *
 * @param {HTMLElement} target - The directive binding element.
 * @param {*} binding - The directive props binding.
 */
export default (el: HTMLElement, binding: any): void => {
  for (const child of el.children) {
    const childElement = child as HTMLElement;
    if (childElement.getAttribute('data-id') == binding.value) {
      childElement.style.cssText = `outline: 2px solid ${primaryColor} !important;`;
    } else {
      childElement.style.outline = 'none';
    }
  }
};
