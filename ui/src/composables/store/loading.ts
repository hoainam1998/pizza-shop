import { reactive } from 'vue';

export default reactive({
  loading: false,
  showLoading() {
    this.loading = true;
  },
  hideLoading() {
    this.loading = false;
  }
});
