/**
 * Highlight selected category.
 *
 * @param {HTMLElement} target - The directive binding element.
 * @param {*} binding - The directive props binding.
 */
export default (el: HTMLElement, binding: any): void => {
  for (const child of el.children) {
    if (child.getAttribute('data-id') == binding.value) {
      child.classList.add('selected');
    } else {
      child.classList.remove('selected');
    }
  }
};
