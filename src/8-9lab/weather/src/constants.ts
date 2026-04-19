import type { AQIInfo } from './types/weather';

export const API_KEY = '53dc195b429347530593c844c7f4cb56';
export const BASE_URL = 'https://api.openweathermap.org';
export const ICON_URL = 'https://openweathermap.org/img/wn';

export const weatherToBackground: Record<string, string> = {
  Clear: 'linear-gradient(135deg, #56CCF2, #2F80ED)',
  Clouds: 'linear-gradient(135deg, #868f96, #596164)',
  Rain: 'linear-gradient(135deg, #0F2027, #203A43, #2C5364)',
  Drizzle: 'linear-gradient(135deg, #141E30, #243B55)',
  Thunderstorm: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  Snow: 'linear-gradient(135deg, #E6DADA, #274046)',
  Mist: 'linear-gradient(135deg, #636363, #a2ab58)',
  default: 'linear-gradient(135deg, #11998e, #38ef7d)',
};

export const aqiInfo: Record<number, AQIInfo> = {
  1: { label: 'Хорошее', color: '#4CAF50' },
  2: { label: 'Среднее', color: '#8BC34A' },
  3: { label: 'Умеренное', color: '#FFC107' },
  4: { label: 'Плохое', color: '#FF5722' },
  5: { label: 'Очень плохое', color: '#B71C1C' },
};

export const REFRESH_INTERVAL_MS = 3 * 60 * 60 * 1000;