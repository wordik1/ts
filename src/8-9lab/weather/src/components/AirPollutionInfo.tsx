import React from 'react';
import { aqiInfo } from '../constants';
import type { AirPollutionInfoProps, AQIInfo } from '../types/weather';

const AirPollutionInfo: React.FC<AirPollutionInfoProps> = React.memo(({ data }) => {
  if (!data?.list?.[0]) return null;
  
  const item = data.list[0];
  const { aqi } = item.main;
  const { components } = item;

  const info: AQIInfo = aqiInfo[aqi] || aqiInfo[5];

  return (
    <section className="air-pollution" data-testid="air-pollution" aria-label="Качество воздуха">
      <h3>Качество воздуха</h3>
      <div 
        className="aqi-badge" 
        style={{ backgroundColor: info.color }}
        data-testid="aqi-badge"
        role="status"
      >
        AQI: {aqi} — {info.label}
      </div>
      <div className="pollutants" data-testid="pollutants">
        <p>PM2.5: <strong>{components?.pm2_5?.toFixed(1) ?? 'N/A'}</strong> мкг/м³</p>
        <p>PM10: <strong>{components?.pm10?.toFixed(1) ?? 'N/A'}</strong> мкг/м³</p>
        <p>NO₂: <strong>{components?.no2?.toFixed(1) ?? 'N/A'}</strong> мкг/м³</p>
      </div>
    </section>
  );
});

AirPollutionInfo.displayName = 'AirPollutionInfo';
export default AirPollutionInfo;