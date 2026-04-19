import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WeatherIcon from '../components/WeatherIcon';
import { ICON_URL } from '../constants';

describe('WeatherIcon', () => {
  it('должен рендерить изображение с правильным src', () => {
    render(<WeatherIcon iconCode="10d" description="Light rain" />);
    
    const img = screen.getByAltText('Light rain');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining(`${ICON_URL}/10d@4x.png`));
  });

  it('должен поддерживать разные размеры', () => {
    const { container, rerender } = render(
      <WeatherIcon iconCode="01d" description="Clear sky" size="2x" />
    );
    
    const img = container.querySelector('img') as HTMLImageElement | null;
    expect(img?.src).toContain('@2x.png');
    
    rerender(<WeatherIcon iconCode="01d" description="Clear sky" size="4x" />);
    const updatedImg = container.querySelector('img') as HTMLImageElement | null;
    expect(updatedImg?.src).toContain('@4x.png');
  });

  it('должен иметь data-testid', () => {
    render(<WeatherIcon iconCode="01d" />);
    expect(screen.getByTestId('weather-icon')).toBeInTheDocument();
  });

  it('должен использовать значение по умолчанию для description', () => {
    render(<WeatherIcon iconCode="01d" />);
    const img = screen.getByAltText('weather icon');
    expect(img).toBeInTheDocument();
  });
});