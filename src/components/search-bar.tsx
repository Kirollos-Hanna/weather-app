import { useState, useContext, useEffect } from 'react';
import { useQuery } from 'react-query';

import "./search-bar.css";
import WeatherContext from './weather-context';

const fetchCity = async (city: any) => {
    const apikey = process.env.REACT_APP_WEATHER_API_KEY;
    const cityName = city.queryKey[0];

    const res = await fetch('http://dataservice.accuweather.com/locations/v1/cities/search?apikey=' + apikey + '&q=' + cityName);
    return res.json();
}

const fetchCurrentCity = async (city: any) => {
    const apikey = process.env.REACT_APP_LOCATIONIQ_API_KEY;
    const curLatLong = city.queryKey[1];
    const res: any =
        await fetch('https://eu1.locationiq.com/v1/reverse?key=' + apikey + '&lat=' + curLatLong[0] + '&lon=' + curLatLong[1] + '&format=json');
    return res.json();
}

const SearchBar = () => {
    const [city, setCity] = useState("");
    const [searchError, setSearchError] = useState("");
    const [latLong, setLatLong]: any = useState([]);
    const { setWeatherData }: any = useContext(WeatherContext);

    const { refetch: cityRefetch } = useQuery(city, fetchCity, {
        refetchOnWindowFocus: false,
        enabled: false // disable this query from automatically running
    });

    const { data: curLocationData, refetch: currentLocationRefetch } = useQuery(["CurrentCity", latLong], fetchCurrentCity, {
        refetchOnWindowFocus: false,
        enabled: false // disable this query from automatically running
    })


    function success(position: any) {
        const latitude: any = position.coords.latitude;
        const longitude: any = position.coords.longitude;
        setLatLong([latitude, longitude]);
    }

    function error() {
        console.log('Unable to retrieve your location');
    }

    useEffect(() => {
        if (curLocationData) {
            const curCity = curLocationData.address.city;
            setCity(curCity);
        }
    }, [curLocationData]);

    useEffect(() => {
        if (latLong.length) {
            currentLocationRefetch();
        }
    }, [latLong])

    useEffect(() => {
        // Get the user's latitude and longitude
        if (navigator.geolocation) {
            navigator.permissions
                .query({ name: "geolocation" })
                .then(function (result) {
                    if (result.state === "prompt" || result.state === "granted") {
                        navigator.geolocation.getCurrentPosition(success, error);
                    }
                });
        }
    }, []);


    const handleChange = (event: any) => {
        setSearchError("");
        setCity(event.target.value);
    }

    const handleSearchBtnClick = async () => {
        const refetchedCityData: any = await cityRefetch();

        if (refetchedCityData.status === "error") {
            setSearchError("Invalid request. Try again later");
        }
        else if (refetchedCityData.status === "success" && !refetchedCityData.data.length) {
            setSearchError("Invalid city name");
        } else {
            let requiredWeatherData: any = {};
            requiredWeatherData.city = refetchedCityData.data[0].LocalizedName;
            requiredWeatherData.country = refetchedCityData.data[0].Country.ID;

            requiredWeatherData.key = refetchedCityData.data[0].Key;
            setWeatherData(requiredWeatherData);
        }
    }

    const handleSearchBtnKeyPress = async (event: any) => {
        if (event.key === 'Enter') {
            handleSearchBtnClick()
        }
    }

    return (
        <div className="whole-search-bar-container">
            <div className="search-bar-container">
                <input
                    className={"search-bar-input " + (!!searchError ? "error-border" : "")}
                    type="text"
                    placeholder="Enter City Name"
                    onKeyDown={handleSearchBtnKeyPress}
                    onChange={handleChange}
                    value={city} />
                <button className="show-weather-btn"
                    onClick={handleSearchBtnClick}
                >Show Weather</button>
            </div>
            {!!searchError && <p className="error-text">{searchError}</p>}
        </div>
    );
}

export default SearchBar;