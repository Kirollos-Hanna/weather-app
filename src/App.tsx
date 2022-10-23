import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import './App.css';
import SearchBar from './components/search-bar';
import WeatherCard from './components/weather-card';
import { WeatherProvider } from './components/weather-context';

const queryClient = new QueryClient();

function App() {
  const [weatherData, setWeatherData] = useState({});

  return (
    <QueryClientProvider client={queryClient}>
      <WeatherProvider value={{ weatherData, setWeatherData }}>
        <div className="app-start">
          <SearchBar />
          {Object.keys(weatherData).length !== 0 && <WeatherCard />}
        </div>
      </WeatherProvider>
    </QueryClientProvider>
  );
}

export default App;
