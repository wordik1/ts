import type {
    GeoLocation,
    ForecastResponse,
    AirPollutionResponse
} from '../types/weather.ts';

const API_KEY = '53dc195b429347530593c844c7f4cb56';
const BASE_URL = 'https://api.openweathermap.org';

export const searchCity = async (cityName: string): Promise<GeoLocation[]> => {
  const url = `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding API error');
  return res.json();
};

export const getWeatherForecast = async (lat: number, lon: number): Promise<ForecastResponse> => {
  const url = `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Forecast API error');
  return res.json();
};

export const getAirPollution = async (lat: number, lon: number): Promise<AirPollutionResponse> => {
  const url = `${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Air Pollution API error');
  return res.json();
};

export const API = {
  searchCity,
  getWeatherForecast,
  getAirPollution,
};