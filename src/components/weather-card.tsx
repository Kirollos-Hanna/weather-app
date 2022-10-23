import { useEffect, useContext } from 'react';
import { useQuery } from 'react-query';
import { TailSpin } from 'react-loader-spinner'

import celisus from "./weather-icons/Celisus.svg";
import weatherIcons from './weather-icons/weather-icons';
import WeatherContext from './weather-context';

import "./weather-card.css";

const fetchWeather = async (city: any) => {
    const apikey = process.env.REACT_APP_WEATHER_API_KEY;
    const cityKey = city.queryKey[1].key;

    const res = await
        fetch('http://dataservice.accuweather.com/forecasts/v1/daily/1day/' + cityKey + '?apikey=' + apikey + '&metric=true');

    return res.json();
}

function WeatherCard() {
    const { weatherData, setWeatherData }: any = useContext(WeatherContext);

    const { data: apiWeatherData, status: weatherStatus, refetch: weatherRefetch } =
        useQuery(['weather', weatherData], fetchWeather, {
            refetchOnWindowFocus: false,
            enabled: false // disable this query from automatically running
        });

    useEffect(() => {
        weatherRefetch();
    }, [weatherData.key]);

    useEffect(() => {
        if (apiWeatherData) {
            const currentHour = new Date().getHours();
            let tempToGet = "", cycleToGet = "";
            if (currentHour < 20 && currentHour > 7) {
                tempToGet = "Maximum";
                cycleToGet = "Day";
            } else {
                tempToGet = "Minimum";
                cycleToGet = "Night";
            }
            let requiredWeatherData: any = weatherData;
            requiredWeatherData.degrees = apiWeatherData.DailyForecasts[0].Temperature[tempToGet].Value
            requiredWeatherData.condition = apiWeatherData.DailyForecasts[0][cycleToGet].IconPhrase
            requiredWeatherData.iconNumber = apiWeatherData.DailyForecasts[0][cycleToGet].Icon
            setWeatherData((curData: any) => ({ ...requiredWeatherData }));
        }
    }, [apiWeatherData]);

    if (weatherStatus === "error") {
        return (
            <div className="weather-card" >
                <p className="city-name">Error Getting City Data. Try again later</p>
            </div>)
    } else if (weatherStatus === "loading") {
        return <TailSpin
            height="80"
            width="80"
            color="white"
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
        />
    } else {
        return (
            <div className="weather-card" >
                <div className="text-container">
                    <p className="city-name">{weatherData.city}<span className="country-name">{weatherData.country}</span></p>

                    <p className="weather-degrees">{weatherData.degrees}<img src={celisus} alt="Celisus Degrees" className="celsius-degrees-img" /></p>
                </div>
                <div className="weather-container">
                    <img src={weatherIcons[weatherData.iconNumber]} alt={weatherData.condition + " Icon"} />

                    <p className="weather-condition">{weatherData.condition}</p>
                </div>
            </div >
        );
    }
}

export default WeatherCard;