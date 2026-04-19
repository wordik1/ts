import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AirPollutionInfo from '../components/AirPollutionInfo';
import type { AirPollutionResponse } from '../types/weather';

const mockAirData: AirPollutionResponse = {
  coord: [55.75, 37.62],
  list: [{
    main: { aqi: 2 },
    components: {
      pm2_5: 12.5,
      pm10: 25.3,
      no2: 18.7,
    },
    dt: 1700000000,
  }],
};

describe('AirPollutionInfo', () => {
  it('должен рендерить информацию о качестве воздуха', () => {
    render(<AirPollutionInfo data={mockAirData} />);
    
    expect(screen.getByTestId('aqi-badge')).toHaveTextContent('AQI: 2 — Среднее');
    expect(screen.getByTestId('pollutants')).toHaveTextContent('PM2.5: 12.5 мкг/м³');
  });

  it('должен показывать правильный цвет для AQI', () => {
    const { container } = render(<AirPollutionInfo data={mockAirData} />);
    const badge = screen.getByTestId('aqi-badge');
    
    expect(badge.style.backgroundColor).toBe('rgb(139, 195, 74)');
  });

  it('должен не рендериться при отсутствии данных', () => {
    const { container } = render(<AirPollutionInfo data={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('должен обрабатывать отсутствие значений компонентов', () => {
    const incompleteData: AirPollutionResponse = { 
      coord: [0, 0], 
      list: [{ main: {aqi: 3}, components: {}, dt: 123 }] 
    };
    
    render(<AirPollutionInfo data={incompleteData} />);
    
    expect(screen.getByTestId('pollutants')).toHaveTextContent('PM2.5: N/A мкг/м³');
  });

  it('должен использовать дефолтное значение для неизвестного AQI', () => {
    const badAirData: AirPollutionResponse = { 
      coord: [0, 0], 
      list: [{ main: {aqi: 6 as any}, components: {}, dt: 123 }] 
    };
    
    render(<AirPollutionInfo data={badAirData} />);
    
    expect(screen.getByTestId('aqi-badge')).toHaveTextContent('AQI: 6 — Очень плохое');
  });
});