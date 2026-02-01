<template>
  <section class="ps-px-10">
    <div class="ps-mt-10">
      <h3 class="ps-display-flex ps-flex-align-items-center ps-flex-gap-7 ps-fw-bold ps-line-height-17 ps-my-10">
        <el-icon size="20"><Minus /></el-icon>
        Real time shopping
      </h3>
      <RealTimeShoppingChart :height="300" />
    </div>
    <div class="ps-mt-10">
      <h3 class="ps-display-flex ps-flex-align-items-center ps-flex-gap-7 ps-fw-bold ps-line-height-17 ps-my-10">
        <el-icon size="20"><Minus /></el-icon>
        Real time shopping
      </h3>
      <BestSellingProductsChart :height="450" />
    </div>
    <div class="ps-mt-10">
      <h3 class="ps-display-flex ps-flex-align-items-center ps-flex-gap-7 ps-fw-bold ps-line-height-17 ps-my-10">
        <el-icon size="20"><Minus /></el-icon>
        Real time shopping
      </h3>
      <RevenueChart :height="500" />
    </div>
  </section>
</template>
<script setup lang="ts">
import { Minus } from '@element-plus/icons-vue';
import RevenueChart
from '@/components/admin/charts/revenue-chart/revenue-chart.vue';
import BestSellingProductsChart
from '@/components/admin/charts/best-selling-products-chart/best-selling-products-chart.vue';
import RealTimeShoppingChart from '@/components/admin/charts/real-time-shopping-chart/real-time-shopping-chart.vue';
</script>
