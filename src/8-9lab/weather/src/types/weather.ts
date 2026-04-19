export interface GeoLocation {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface MainWeather {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

export interface Wind {
  speed: number;
  deg: number;
  gust?: number;
}

export interface ForecastItem {
  dt: number;
  dt_txt: string;
  main: MainWeather;
  weather: WeatherCondition[];
  clouds: { all: number };
  wind: Wind;
  visibility: number;
  pop: number;
  sys?: { pod: string };
}

export interface ForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface AirComponents {
  co?: number;
  no?: number;
  no2?: number;
  o3?: number;
  so2?: number;
  pm2_5?: number;
  pm10?: number;
  nh3?: number;
}

export interface AirPollutionItem {
  main: { aqi: 1 | 2 | 3 | 4 | 5 };
  components: AirComponents;
  dt: number;
}

export interface AirPollutionResponse {
  coord: [number, number];
  list: AirPollutionItem[];
}

export interface CitySearchProps {
  onSearch: (lat: number, lon: number, name: string) => void;
  loading: boolean;
}

export interface WeatherIconProps {
  iconCode: string;
  description?: string;
  size?: '1x' | '2x' | '4x';
}

export interface CurrentWeatherProps {
  data: ForecastResponse | null;
}

export interface ForecastListProps {
  list: ForecastItem[];
}

export interface AirPollutionInfoProps {
  data: AirPollutionResponse | null;
}

export interface AQIInfo {
  label: string;
  color: string;
}