const selectDirectiveFunc = (el: HTMLElement, binding: any): void => {
  for (const child of el.children) {
    if (child.getAttribute('data-id') == binding.value) {
      child.classList.add('selected');
    } else {
      child.classList.remove('selected');
    }
  }
};

export default {
  updated: selectDirectiveFunc,
  mounted: selectDirectiveFunc,
};
