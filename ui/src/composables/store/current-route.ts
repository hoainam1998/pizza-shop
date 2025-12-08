import { CurrentRouteStorage } from '@/storage/local-storage';

export default {
  setCurrentRoute(value: string): void {
    CurrentRouteStorage.setItem(value);
  },
  getCurrentRoute(): string | undefined {
    return CurrentRouteStorage.getItem();
  }
};
