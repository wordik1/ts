import React, { useMemo } from 'react';
import WeatherIcon from './WeatherIcon';
import { groupForecastByDay, formatDate, roundTemp } from '../utils/weatherUtils';
import type { ForecastListProps, ForecastItem } from '../types/weather';

const ForecastList: React.FC<ForecastListProps> = React.memo(({ list }) => {
  const dailyForecast = useMemo(() => groupForecastByDay(list), [list]);

  if (!dailyForecast.length) {
    return <p className="empty-state" data-testid="forecast-empty">Нет данных прогноза</p>;
  }

  return (
    <section className="forecast-list" data-testid="forecast-list" aria-label="Прогноз на 5 дней">
      <h3>Прогноз на 5 дней</h3>
      <div className="forecast-grid">
        {dailyForecast.map((item: ForecastItem) => {
          const weather = item.weather[0];
          return (
            <article key={item.dt} className="forecast-card" data-testid="forecast-card">
              <p className="forecast-date" data-testid="forecast-date">
                {formatDate(item.dt)}
              </p>
              <WeatherIcon iconCode={weather.icon} description={weather.description} size="2x" />
              <p className="forecast-temp" data-testid="forecast-temp">
                {roundTemp(item.main.temp)}°C
              </p>
              <p className="forecast-desc">{weather.description}</p>
              <p className="forecast-details">
                💨 {item.wind.speed} м/с | 💧 {item.main.humidity}%
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
});

ForecastList.displayName = 'ForecastList';
export default ForecastList;