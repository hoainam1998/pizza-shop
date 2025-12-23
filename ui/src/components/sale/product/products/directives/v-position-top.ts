import { nextTick } from 'vue';

const vPositionTop = {
  mounted: (el: HTMLElement): void => {
    const containerElement = el.parentElement!;
    const getPreviousElementHeight = (targetElement: HTMLElement = containerElement): number => {
      const previousElementSibling = targetElement.previousElementSibling as HTMLElement;
      if (previousElementSibling) {
        let totalPreviousHeight: number = +previousElementSibling!.clientHeight;
        return (totalPreviousHeight += getPreviousElementHeight(previousElementSibling));
      }
      return 0;
    };
    nextTick(() => {
      const top = getPreviousElementHeight();
      el.style.top = `${top}px`;
    });
  },
};

export default vPositionTop;
