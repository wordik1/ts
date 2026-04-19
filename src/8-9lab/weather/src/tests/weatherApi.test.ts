import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { API } from '../services/weatherApi';
import type { GeoLocation, ForecastResponse, AirPollutionResponse } from '../types/weather';

const mockFetch = vi.fn();

Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true,
  configurable: true,
});

describe('weatherApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchCity', () => {
    it('должен возвращать данные города при успешном запросе', async () => {
      const mockData: GeoLocation[] = [{ name: 'Moscow', lat: 55.75, lon: 37.62 }];
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await API.searchCity('Moscow');
      
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/geo/1.0/direct?q=Moscow')
      );
    });

    it('должен выбрасывать ошибку при неудачном запросе', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      
      await expect(API.searchCity('InvalidCity'))
        .rejects.toThrow('Geocoding API error');
    });
  });

  describe('getWeatherForecast', () => {
    it('должен возвращать прогноз погоды', async () => {
      const mockData: ForecastResponse = {
        cod: '200',
        message: 0,
        cnt: 40,
        list: [{ 
          dt: 123456, 
          dt_txt: '2024-01-01 12:00:00',
          main: { temp: 20, feels_like: 18, temp_min: 19, temp_max: 21, pressure: 1013, humidity: 65 },
          weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
          clouds: { all: 0 },
          wind: { speed: 3, deg: 180 },
          visibility: 10000,
          pop: 0,
        }],
        city: {
          id: 1,
          name: 'Test',
          coord: { lat: 55, lon: 37 },
          country: 'RU',
          population: 1000000,
          timezone: 10800,
          sunrise: 123456,
          sunset: 123456,
        },
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await API.getWeatherForecast(55.75, 37.62);
      
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/data/2.5/forecast?lat=55.75&lon=37.62')
      );
    });
  });

  describe('getAirPollution', () => {
    it('должен возвращать данные о загрязнении воздуха', async () => {
      const mockData: AirPollutionResponse = {
        coord: [55.75, 37.62],
        list: [{ 
          main: { aqi: 2 }, 
          components: { pm2_5: 10, pm10: 20, no2: 15 }, 
          dt: 123456 
        }],
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await API.getAirPollution(55.75, 37.62);
      
      expect(result).toEqual(mockData);
    });
  });
});