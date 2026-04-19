import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ForecastList from '../components/ForecastList';
import type { ForecastItem } from '../types/weather';

const mockForecastList: ForecastItem[] = [
  {
    dt: 1700000000,
    dt_txt: '2023-11-15 12:00:00',
    main: { 
      temp: 15.5, 
      feels_like: 14, 
      temp_min: 14, 
      temp_max: 17, 
      pressure: 1013, 
      humidity: 70 
    },
    weather: [{ id: 500, icon: '10d', main: 'Rain', description: 'Light rain' }],
    clouds: { all: 75 },
    wind: { speed: 3.5, deg: 180 },
    visibility: 10000,
    pop: 0.5,
  },
  {
    dt: 1700086400,
    dt_txt: '2023-11-16 12:00:00',
    main: { 
      temp: 12.3, 
      feels_like: 11, 
      temp_min: 11, 
      temp_max: 14, 
      pressure: 1015, 
      humidity: 80 
    },
    weather: [{ id: 803, icon: '04d', main: 'Clouds', description: 'Clouds' }],
    clouds: { all: 90 },
    wind: { speed: 4.2, deg: 200 },
    visibility: 10000,
    pop: 0.2,
  },
];

describe('ForecastList', () => {
  it('должен рендерить карточки прогноза', () => {
    render(<ForecastList list={mockForecastList} />);
    
    const cards = screen.getAllByTestId('forecast-card');
    expect(cards).toHaveLength(2);
    
    expect(screen.getAllByTestId('forecast-temp')[0]).toHaveTextContent('16°C');
    expect(screen.getAllByTestId('forecast-desc')[0]).toHaveTextContent('Light rain');
  });

  it('должен показывать пустое состояние при отсутствии данных', () => {
    render(<ForecastList list={[]} />);
    expect(screen.getByTestId('forecast-empty')).toBeInTheDocument();
  });

  it('должен группировать прогноз по дням', () => {
    const sameDayList: ForecastItem[] = [
      { 
        dt: 1700000000, 
        dt_txt: '2023-11-15 09:00:00', 
        main: { temp: 10, feels_like: 9, temp_min: 9, temp_max: 11, pressure: 1013, humidity: 70 },
        weather: [{ id: 800, icon: '01d', main: 'Clear', description: 'Clear' }],
        clouds: { all: 10 },
        wind: { speed: 1, deg: 180 },
        visibility: 10000,
        pop: 0,
      },
      { 
        dt: 1700010000, 
        dt_txt: '2023-11-15 12:00:00', 
        main: { temp: 15, feels_like: 14, temp_min: 14, temp_max: 16, pressure: 1013, humidity: 65 },
        weather: [{ id: 801, icon: '02d', main: 'Clouds', description: 'Few clouds' }],
        clouds: { all: 20 },
        wind: { speed: 2, deg: 190 },
        visibility: 10000,
        pop: 0,
      },
    ];
    
    render(<ForecastList list={sameDayList} />);
    
    // Должна быть только одна карточка (выбрана запись ближе к 12:00)
    expect(screen.getAllByTestId('forecast-card')).toHaveLength(1);
    expect(screen.getByTestId('forecast-temp')).toHaveTextContent('15°C');
  });
});