import React, { useMemo } from 'react';
import WeatherIcon from './WeatherIcon';
import { getHourlyForecast, groupHourlyByDay, roundTemp, formatDate } from '../utils/weatherUtils';
import type { ForecastListProps } from '../types/weather';

const HourlyForecast: React.FC<ForecastListProps> = React.memo(({ list }) => {
  const hourlyData = useMemo(() => getHourlyForecast(list, 2), [list]);
  const groupedByDay = useMemo(() => groupHourlyByDay(hourlyData), [hourlyData]);
  const days = Object.keys(groupedByDay);

  if (!hourlyData.length) return null;

  return (
    <div className="hourly-section">
      <h3>Почасовой прогноз</h3>
      
      {days.map((date, index) => {
        const dayItems = groupedByDay[date];
        const isToday = index === 0;
        
        return (
          <div key={date} className="hourly-day-block">
            <span className="hourly-day-title">
              {isToday ? 'Сегодня' : formatDate(Date.parse(date + 'T00:00:00') / 1000)}
            </span>
            
            <div className="hourly-scroll-container">
              {dayItems.map((item) => {
                const time = item.dt_txt.split(' ')[1].substring(0, 5);
                const weather = item.weather[0];

                return (
                  <div key={item.dt} className="hourly-card">
                    <span className="hourly-time">{time}</span>
                    <WeatherIcon iconCode={weather.icon} description={weather.description} size="2x" />
                    <span className="hourly-temp">{roundTemp(item.main.temp)}°</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
});

HourlyForecast.displayName = 'HourlyForecast';
export default HourlyForecast;