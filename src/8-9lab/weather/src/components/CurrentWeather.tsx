import React from 'react';
import WeatherIcon from './WeatherIcon';
import { roundTemp } from '../utils/weatherUtils';
import type { CurrentWeatherProps } from '../types/weather';

const CurrentWeather: React.FC<CurrentWeatherProps> = React.memo(({ data }) => {
  if (!data?.list?.[0]) return null;
  
  const current = data.list[0];
  const { temp, feels_like, humidity } = current.main;
  const { speed } = current.wind;
  const weather = current.weather[0];

  return (
    <section className="current-weather" data-testid="current-weather" aria-label="Текущая погода">
      <WeatherIcon iconCode={weather.icon} description={weather.description} />
      <h2 data-testid="current-temp">{roundTemp(temp)}°C</h2>
      <p data-testid="current-desc">{weather.description}</p>
      <p>Ощущается как {roundTemp(feels_like)}°C</p>
      <p className="weather-details">
         {speed} м/с | 󰖌 {humidity}%
      </p>
    </section>
  );
});

CurrentWeather.displayName = 'CurrentWeather';
export default CurrentWeather;