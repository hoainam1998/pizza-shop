jest.mock('cron', () => {
  const actualCron = jest.requireActual('cron');
  return {
    CronJob: class extends actualCron.CronJob {
      constructor(date: Date, action: () => void) {
        super(date, action);
        globalThis.cronJob = this;
      }
      start = jest.fn();
    },
    CronTime: class extends actualCron.CronTime {},
  };
});
