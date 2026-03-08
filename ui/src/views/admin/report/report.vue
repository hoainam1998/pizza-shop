<template>
  <section class="ps-px-10">
    <div class="ps-mt-10">
      <h3 class="ps-display-flex ps-flex-align-items-center ps-flex-gap-7 ps-fw-bold ps-line-height-17 ps-my-10">
        <el-icon size="20">
          <Minus />
        </el-icon>
        Real time shopping
      </h3>
      <RealTimeShoppingChart :height="300" @onLoad="loadRealTimeShoppingChart" ref="real-time-shopping-chart" />
    </div>
    <div class="ps-mt-10">
      <h3 class="ps-display-flex ps-flex-align-items-center ps-flex-gap-7 ps-fw-bold ps-line-height-17 ps-my-10">
        <el-icon size="20"><Minus /></el-icon>
        Best selling products
      </h3>
      <BestSellingProductsChart :height="450" @onLoad="loadBestSellingProductsChart" ref="best-selling-product-chart" />
    </div>
    <div class="ps-mt-10">
      <h3 class="ps-display-flex ps-flex-align-items-center ps-flex-gap-7 ps-fw-bold ps-line-height-17 ps-my-10">
        <el-icon size="20"><Minus /></el-icon>
        Revenue
      </h3>
      <RevenueChart :height="500" @onLoad="loadRevenueChart" ref="revenue-chart" />
    </div>
  </section>
</template>
<script setup lang="ts">
import { onBeforeMount, useTemplateRef } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { Minus } from '@element-plus/icons-vue';
import RevenueChart
from '@/components/admin/charts/revenue-chart/revenue-chart.vue';
import BestSellingProductsChart
from '@/components/admin/charts/best-selling-products-chart/best-selling-products-chart.vue';
import RealTimeShoppingChart from '@/components/admin/charts/real-time-shopping-chart/real-time-shopping-chart.vue';
import { ProductService } from '@/services';
import type { BestSellingProductsChartPropsType, ChartPayloadType } from '@/interfaces';
import { showErrorNotification } from '@/utils';
import SocketService from '@/socket';
import { SOCKET_EVENT_NAME } from '@/enums';

type BestSellingProductsDataChartType = {
  count: number;
  name: string;
};

const realTimeShoppingChartRef = useTemplateRef('real-time-shopping-chart');
const revenueChartRef = useTemplateRef('revenue-chart');
const bestSellingProductChartRef = useTemplateRef('best-selling-product-chart');

const loadRealTimeShoppingChart = (): void => {
  ProductService.post('load-data-purchase-volume-chart', {})
    .then((response) => realTimeShoppingChartRef.value?.onLoadingComplete(response.data))
    .catch((error) => {
      realTimeShoppingChartRef.value?.onLoadingComplete();
      showErrorNotification('Load real time shopping chart!', error.response.data.message);
    });
};

const loadBestSellingProductsChart = (
  payload: ChartPayloadType
): void => {
  ProductService.post('load-data-best-selling-products-chart', payload)
    .then((response) => {
      const data = response.data.reduce((
        obj: BestSellingProductsChartPropsType,
        item: BestSellingProductsDataChartType,
      ) => {
          obj.values.push(item.count);
          obj.labels.push(item.name);
          return obj;
      }, {
        values: [],
        labels: [],
      });
      bestSellingProductChartRef.value?.onLoadingComplete(data);
    }).catch((error) => {
      bestSellingProductChartRef.value?.onLoadingComplete();
      showErrorNotification('Load best selling products chart!', error.response.data.message);
    });
};

const loadRevenueChart = (payload: ChartPayloadType): void => {
  ProductService.post('load-data-revenue-chart', payload)
    .then((response) => revenueChartRef.value?.onLoadingComplete(response.data))
    .catch((error) => {
      revenueChartRef.value?.onLoadingComplete();
      showErrorNotification('Load revenue chart!', error.response.data.message);
    });
};

onBeforeMount(() => {
  SocketService.subscribe(SOCKET_EVENT_NAME.ADD_DATA_CHART, (payload) => {
    if (realTimeShoppingChartRef.value) {
      realTimeShoppingChartRef.value.addDataChart(payload);
    }
  });
});

onBeforeRouteLeave(() => {
  SocketService.unsubscribe(SOCKET_EVENT_NAME.ADD_DATA_CHART);
  SocketService.disconnect();
});
</script>
