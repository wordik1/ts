import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CitySearch from '../components/CitySearch';
import * as weatherApi from '../services/weatherApi';

vi.mock('../services/weatherApi', () => ({
  API: {
    searchCity: vi.fn(),
    getWeatherForecast: vi.fn(),
    getAirPollution: vi.fn(),
  },
}));

const mockSearchCity = vi.mocked(weatherApi.API.searchCity);

describe('CitySearch', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен рендерить форму поиска', () => {
    render(<CitySearch onSearch={mockOnSearch} loading={false} />);
    expect(screen.getByTestId('city-search-form')).toBeInTheDocument();
    expect(screen.getByTestId('city-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
  });

  it('должен вызывать onSearch при успешном поиске', async () => {
    // 🔹 3. Используем mockSearchCity напрямую
    mockSearchCity.mockResolvedValueOnce([{ name: 'London', lat: 51.5, lon: -0.12 }]);

    render(<CitySearch onSearch={mockOnSearch} loading={false} />);

    const input = screen.getByTestId('city-input');
    const button = screen.getByTestId('search-button');

    fireEvent.change(input, { target: { value: 'London' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith(51.5, -0.12, 'London');
    });
  });

  it('должен показывать ошибку, если город не найден', async () => {
    mockSearchCity.mockResolvedValueOnce([]);

    render(<CitySearch onSearch={mockOnSearch} loading={false} />);

    fireEvent.change(screen.getByTestId('city-input'), { target: { value: 'NotFound' } });
    fireEvent.click(screen.getByTestId('search-button'));

    await waitFor(() => {
      expect(screen.getByTestId('search-error')).toHaveTextContent('Город не найден');
    });
  });

  it('должен блокировать кнопку при загрузке', () => {
    render(<CitySearch onSearch={mockOnSearch} loading={true} />);
    expect(screen.getByTestId('search-button')).toBeDisabled();
  });

  it('должен очищать поле ввода после успешного поиска', async () => {
    mockSearchCity.mockResolvedValueOnce([{ name: 'Paris', lat: 48.85, lon: 2.35 }]);

    render(<CitySearch onSearch={mockOnSearch} loading={false} />);

    const input = screen.getByTestId('city-input');
    fireEvent.change(input, { target: { value: 'Paris' } });
    fireEvent.click(screen.getByTestId('search-button'));

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
});