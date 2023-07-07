import { DateTime } from "luxon";

const API_KEY = '9e6e55ee2b6cf9bb84e9e867dd0d74cd';
const BASE_URL = "https://api.openweathermap.org/data/2.5/";

// https://api.openweathermap.org/data/2.5/onecall?lat=48.8534&lon=2.3488&exclude=current,minutely,hourly,alerts&appid=1fa9ff4126d95b8db54f3897a208e91c&units=metric

const getWeatherData = (infoType, searchParams) => {
  const url = new URL(BASE_URL + "/" + infoType);
  url.search = new URLSearchParams({ ...searchParams, appid: API_KEY });

  return fetch(url).then((res) => res.json());
};

const formatCurrentWeather = (data) => {
  const {
    coord: { lat, lon },
    main: { temp, feels_like, temp_min, temp_max, humidity },
    name,
    dt,
    sys: { country, sunrise, sunset },
    weather,
    wind: { speed },
  } = data;

  const { main: details, icon } = weather[0];

  return {
    lat,
    lon,
    temp,
    feels_like,
    temp_min,
    temp_max,
    humidity,
    name,
    dt,
    country,
    sunrise,
    sunset,
    details,
    icon,
    speed,
  };
};

const formatForecastWeather = (data) => {
    let { daily = [], hourly = [] } = data;
  
    if (daily.length > 1) {
      daily = daily.slice(1, 6).map((d) => {
        return {
          title: formatToLocalTime(d.dt, data.timezone, "ccc"),
          temp: d.temp.day,
          icon: d.weather[0].icon,
        };
      });
    }
  
    if (hourly.length > 1) {
      hourly = hourly.slice(1, 6).map((d) => {
        return {
          title: formatToLocalTime(d.dt, data.timezone, "hh:mm a"),
          temp: d.temp,
          icon: d.weather[0].icon,
        };
      });
    }
  
    return { timezone: data.timezone || "Unknown", daily, hourly };
  };
  
  const getFormattedWeatherData = async (searchParams) => {
    const formattedCurrentWeather = await getWeatherData("weather", searchParams).then(formatCurrentWeather);
  
    const { lat, lon } = formattedCurrentWeather;
  
    const formattedForecastWeather = await getWeatherData("onecall", {
      lat,
      lon,
      exclude: "current,minutely,alerts",
      units: searchParams.units,
    }).then(formatForecastWeather);
  
    return { ...formattedCurrentWeather, ...formattedForecastWeather };
  };
  const formatToLocalTime = (secs, zone, format = "cccc, dd LLL yyyy' | Local time: 'hh:mm a") => {
    if (!secs || !zone) {
      return "Unknown";
    }
  
    const dt = DateTime.fromSeconds(secs);
    if (!dt.isValid) {
      return "Invalid DateTime";
    }
  
    return dt.setZone(zone).toFormat(format);
  };

const iconUrlFromCode = (code) =>
  `http://openweathermap.org/img/wn/${code}@2x.png`;

export default getFormattedWeatherData;

export { formatToLocalTime, iconUrlFromCode };