import React, { useMemo } from 'react';
import WeatherIcon from './WeatherIcon';
import { getHourlyForecast, roundTemp } from '../utils/weatherUtils';
import type { ForecastListProps } from '../types/weather';

const HourlyForecast: React.FC<ForecastListProps> = React.memo(({ list }) => {
  const hourlyData = useMemo(() => getHourlyForecast(list, 1), [list]);

  if (!hourlyData.length) return null;

  const firstDate = hourlyData[0]?.dt_txt.split(' ')[0];
  const tomorrowIndex = hourlyData.findIndex(item => 
    item.dt_txt.split(' ')[0] !== firstDate
  );

  return (
    <div className="hourly-section">
      <h3>Почасовой прогноз</h3>
      
      <div className="hourly-scroll-container">
        {hourlyData.map((item, index) => {
          const time = item.dt_txt.split(' ')[1].substring(0, 5);
          const weather = item.weather[0];
          const itemDate = item.dt_txt.split(' ')[0];
          const isTomorrow = itemDate !== firstDate;
          
          const showDayLabel = isTomorrow && index === tomorrowIndex;

          return (
            <React.Fragment key={item.dt}>
              {showDayLabel && (
                <div className="hourly-day-label">
                  <span>Завтра</span>
                </div>
              )}
              
              <div className={`hourly-card ${isTomorrow ? 'tomorrow' : ''}`}>
                <span className="hourly-time">{time}</span>
                <WeatherIcon iconCode={weather.icon} description={weather.description} size="2x" />
                <span className="hourly-temp">{roundTemp(item.main.temp)}°</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
});

HourlyForecast.displayName = 'HourlyForecast';
export default HourlyForecast;