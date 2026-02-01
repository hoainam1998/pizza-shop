import { computed, type CSSProperties } from 'vue';
import type { SizeChartType } from '@/interfaces';

export default function useSizeChart(size: SizeChartType) {
  const { width, height } = size;

  return computed<CSSProperties>(() => {
    const sizeChart = {};
    if (height) {
      if (typeof height === 'number') {
        Object.assign(sizeChart, { height: `${height}px` });
      } else {
        Object.assign(sizeChart, { height });
      }
    }

    if (width) {
      if (typeof width === 'number') {
        Object.assign(sizeChart, { width: `${width}px` });
      } else {
        Object.assign(sizeChart, { width });
      }
    }

    return sizeChart;
  });
}
