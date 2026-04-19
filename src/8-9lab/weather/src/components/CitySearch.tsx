import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import { API } from '../services/weatherApi';
import type { CitySearchProps } from '../types/weather';

const CitySearch: React.FC<CitySearchProps> = React.memo(({ onSearch, loading }) => {
  const [city, setCity] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!city.trim() || loading) return;

    try {
      setError(null);
      const data = await API.searchCity(city.trim());
      
      if (!data?.length) {
        setError('Город не найден');
        return;
      }
      
      const { lat, lon, name } = data[0];
      onSearch(lat, lon, name);
      setCity('');
    } catch (err) {
      setError('Ошибка при поиске города');
      console.error('Search error:', err);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setCity(e.target.value);
    if (error) setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form" data-testid="city-search-form">
      <input
        type="text"
        value={city}
        onChange={handleChange}
        placeholder="Введите город..."
        disabled={loading}
        className="search-input"
        data-testid="city-input"
        aria-label="Поиск города"
        autoComplete="off"
      />
      <button 
        type="submit" 
        disabled={loading || !city.trim()} 
        className="search-btn"
        data-testid="search-button"
        aria-label="Найти"
      >
        {loading ? 'загрузка' : 'поиск'}
      </button>
      {error && (
        <span className="search-error" role="alert" data-testid="search-error">
          {error}
        </span>
      )}
    </form>
  );
});

CitySearch.displayName = 'CitySearch';
export default CitySearch;