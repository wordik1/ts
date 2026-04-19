import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { weatherToBackground, REFRESH_INTERVAL_MS } from './constants';
import { API } from './services/weatherApi';
import type { ForecastResponse, AirPollutionResponse } from './types/weather';
import CitySearch from './components/CitySearch';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import AirPollutionInfo from './components/AirPollutionInfo';
import HourlyForecast from './components/HourlyForecast';

interface CityCoords {
  lat: number;
  lon: number;
}

const App: React.FC = () => {
  const [weatherData, setWeatherData] = useState<ForecastResponse | null>(null);
  const [airData, setAirData] = useState<AirPollutionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cityCoords, setCityCoords] = useState<CityCoords | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async (lat: number, lon: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const [weatherRes, airRes] = await Promise.all([
        API.getWeatherForecast(lat, lon),
        API.getAirPollution(lat, lon),
      ]);
      
      setWeatherData(weatherRes);
      setAirData(airRes);
      setLastUpdate(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки данных';
      setError(message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cityCoords) return;
    
    fetchData(cityCoords.lat, cityCoords.lon);
    
    const intervalId = setInterval(() => {
      fetchData(cityCoords.lat, cityCoords.lon);
    }, REFRESH_INTERVAL_MS);
    
    return () => clearInterval(intervalId);
  }, [cityCoords, fetchData]);

  const handleSearch = useCallback((lat: number, lon: number, name: string): void => {
    setCityCoords({ lat, lon });
    setCityName(name);
  }, []);

  const currentWeatherMain = weatherData?.list?.[0]?.weather?.[0]?.main;
  const bgStyle: React.CSSProperties = {
    background: weatherToBackground[currentWeatherMain ?? ''] || weatherToBackground.default,
  };

  return (
    <div className="app-container" style={bgStyle} data-testid="app-container">
      <header className="app-header">
        <h1>☁️ Weather Report</h1>
        <CitySearch onSearch={handleSearch} loading={loading} />
        {cityName && (
          <p className="city-name" data-testid="city-name">{cityName}</p>
        )}
        {lastUpdate && (
          <p className="update-time" data-testid="last-update">
            Обновлено: {lastUpdate.toLocaleTimeString('ru-RU')}
          </p>
        )}
      </header>

      <main className="app-content">
        {error && (
          <div className="error-message" role="alert" data-testid="error-message">
            ⚠️ {error}
          </div>
        )}
        
        {loading && !weatherData && (
          <div className="loader" data-testid="loading">Загрузка погоды...</div>
        )}
        
        {weatherData && (
          <>
            <CurrentWeather data={weatherData} />
            <ForecastList list={weatherData.list} />
            <HourlyForecast list={weatherData.list} />
            <AirPollutionInfo data={airData} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Данные предоставлены OpenWeather API • Автообновление каждые 3 часа</p>
      </footer>
    </div>
  );
};

export default App;