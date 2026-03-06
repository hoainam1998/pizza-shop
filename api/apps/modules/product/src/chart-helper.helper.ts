import * as prisma from 'generated/prisma';
import { DataChartType } from '@share/interfaces';
import { CHART_BY } from '@share/enums';
import { getDate, getHours, getMonth, getQuarter } from 'date-fns';

/**
 * Select revenue and capital each bill.
 *
 * @param {Pick<prisma.bill, 'capital' | 'created_at' | 'complete_total'>[]} bills - The bills.
 * @param {string=} by - The mode of chart.
 */
export const action =
  (bills: Pick<prisma.bill, 'capital' | 'created_at' | 'complete_total'>[], by?: string) =>
  (start: number, end: number, coreData: DataChartType): void => {
    const { revenue, capital } = bills
      .filter((bill) => +bill.created_at >= start && +bill.created_at < end)
      .reduce<{
        revenue: number;
        capital: number;
      }>(
        (data, bill) => {
          data.revenue += bill.complete_total - bill.capital;
          data.capital += bill.capital;
          return data;
        },
        {
          revenue: 0,
          capital: 0,
        },
      );

    if (coreData.labels && by) {
      switch (by) {
        case CHART_BY.DAY:
          coreData.labels.push(getHours(start) + 'h'.toString());
          break;
        case CHART_BY.MONTH:
          coreData.labels.push(getDate(start).toString());
          break;
        case CHART_BY.QUARTER:
          coreData.labels.push(getQuarter(start).toString());
          break;
        case CHART_BY.YEAR:
          coreData.labels.push((getMonth(start) + 1).toString());
          break;
        default:
          break;
      }
    }
    coreData.revenue.push(revenue);
    coreData.capital.push(capital);
  };
