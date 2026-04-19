import React from 'react';
import { ICON_URL } from '../constants.ts';
import type { WeatherIconProps } from '../types/weather';

const WeatherIcon: React.FC<WeatherIconProps> = React.memo(({ 
  iconCode, 
  description = 'weather icon', 
  size = '4x' 
}) => (
  <div className="weather-icon-wrapper" data-testid="weather-icon">
    <img 
      src={`${ICON_URL}/${iconCode}@${size}.png`} 
      alt={description} 
      className="weather-icon"
      loading="lazy"
      width={size === '4x' ? 128 : size === '2x' ? 64 : 32}
      height={size === '4x' ? 128 : size === '2x' ? 64 : 32}
    />
  </div>
));

WeatherIcon.displayName = 'WeatherIcon';
export default WeatherIcon;