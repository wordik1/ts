import type { ForecastItem } from '../types/weather';

export const groupForecastByDay = (list: ForecastItem[]): ForecastItem[] => {
  if (!list?.length) return [];
  
  const days: Record<string, ForecastItem> = {};
  
  list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0];
    if (!days[date]) {
      days[date] = item;
    } else if (item.dt_txt.split(' ')[1].startsWith('12')) {
      days[date] = item;
    }
  });
  
  return Object.values(days);
};

export const formatDate = (timestamp: number, locale: string = 'ru-RU'): string => {
  return new Date(timestamp * 1000).toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

export const roundTemp = (temp: number): number => Math.round(temp);

export const formatTime = (timestamp: number, locale: string = 'ru-RU'): string => {
  return new Date(timestamp * 1000).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
};