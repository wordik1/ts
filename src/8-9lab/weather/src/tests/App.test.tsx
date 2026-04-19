import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';
import * as weatherApi from '../services/weatherApi';
import type { ForecastResponse, AirPollutionResponse } from '../types/weather';

vi.mock('../components/CitySearch', () => ({
    default: ({ onSearch }: { onSearch: (lat: number, lon: number, name: string) => void }) => (
        <button 
        data-testid="mock-city-search" 
        onClick={() => onSearch(55.75, 37.62, 'Moscow')}
        >
        Выбрать Москву
        </button>
    ),
}));

vi.mock('../services/weatherApi', () => ({
    API: {
        getWeatherForecast: vi.fn(),
        getAirPollution: vi.fn(),
        searchCity: vi.fn(),
    },
}));

const mockGetWeatherForecast = vi.mocked(weatherApi.API.getWeatherForecast);
const mockGetAirPollution = vi.mocked(weatherApi.API.getAirPollution);

const mockWeatherData: ForecastResponse = {
    cod: '200',
    message: 0,
    cnt: 40,
    list: [{
        dt: 1700000000,
        dt_txt: '2023-11-15 12:00:00',
        main: { temp: 20, feels_like: 18, temp_min: 19, temp_max: 21, pressure: 1013, humidity: 65 },
        weather: [{ id: 800, icon: '01d', main: 'Clear', description: 'Clear sky' }],
        clouds: { all: 0 },
        wind: { speed: 2.5, deg: 180 },
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

const mockAirData: AirPollutionResponse = {
    coord: [55, 37],
    list: [{ 
        main: { aqi: 1 }, 
        components: { pm2_5: 5, pm10: 10, no2: 8 }, 
        dt: 1700000000 
    }],
};

describe('App', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('должен рендерить заголовок и форму поиска', () => {
        render(<App />);
        expect(screen.getByText('☁️ Погода & Воздух')).toBeInTheDocument();
        expect(screen.getByTestId('mock-city-search')).toBeInTheDocument();
    });

    it('должен отображать данные после успешной загрузки', async () => {
        mockGetWeatherForecast.mockResolvedValueOnce(mockWeatherData);
        mockGetAirPollution.mockResolvedValueOnce(mockAirData);

        render(<App />);

        const selectCityBtn = screen.getByTestId('mock-city-search');
        await userEvent.click(selectCityBtn);

        await waitFor(() => {
        expect(screen.queryByTestId('current-temp')).toHaveTextContent('20°C');
        }, { timeout: 3000 });

        expect(screen.getByTestId('current-weather')).toBeInTheDocument();
        expect(screen.getByTestId('forecast-list')).toBeInTheDocument();
        expect(screen.getByTestId('air-pollution')).toBeInTheDocument();
        
        expect(mockGetWeatherForecast).toHaveBeenCalledWith(55.75, 37.62);
        expect(mockGetAirPollution).toHaveBeenCalledWith(55.75, 37.62);
    });

    it('должен изменять фон в зависимости от погоды', async () => {
        mockGetWeatherForecast.mockResolvedValueOnce(mockWeatherData);
        mockGetAirPollution.mockResolvedValueOnce(mockAirData);

        render(<App />);
        await userEvent.click(screen.getByTestId('mock-city-search'));

        await waitFor(() => {
            expect(screen.queryByTestId('current-temp')).toBeInTheDocument();
        }, { timeout: 3000 });

        const appContainer = screen.getByTestId('app-container');
        expect(appContainer.style.background).toContain('rgb(86, 204, 242)'); // #56CCF2
        expect(appContainer.style.background).toContain('rgb(47, 128, 237)');  // #2F80ED
    });

    it('должен планировать обновление каждые 3 часа', async () => {
        const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
        
        mockGetWeatherForecast.mockResolvedValue(mockWeatherData);
        mockGetAirPollution.mockResolvedValue(mockAirData);

        render(<App />);
        await userEvent.click(screen.getByTestId('mock-city-search'));

        await waitFor(() => {
            expect(mockGetWeatherForecast).toHaveBeenCalledTimes(1);
        }, { timeout: 3000 });

        expect(setIntervalSpy).toHaveBeenCalledWith(
            expect.any(Function), 3 * 60 * 60 * 1000
        );

        setIntervalSpy.mockRestore();
    });
});