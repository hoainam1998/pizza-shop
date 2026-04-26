import constants from '@/constants';

export default {
  setAppName(): void {
    document.cookie = `app=${isSale ? 'sale' : 'admin'}`;
  },
  setImpactUserApiKey(apiKey: string): void {
    this.clearApiKey();
    document.cookie = `${constants.IMPACT_USER_API_KEY}=${apiKey}`;
  },
  clearApiKey(): void {
    document.cookie = `${constants.IMPACT_USER_API_KEY}=; max-age=0`;
  },
};
