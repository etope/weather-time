/*!
 * Copyright 2024, Staffbase GmbH and contributors.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { ReactElement, useState, useEffect } from "react";
import { BlockAttributes } from "widget-sdk";

/**
 * React Component
 */
export interface WeatherTimeProps extends BlockAttributes {
  city: string;
}

export const WeatherTime = ({ city }: WeatherTimeProps): ReactElement => {
  const [weatherDescription, setWeatherDescription] = useState<string>("Loading...");
  const [iconUrl, setIconUrl] = useState<string>("");
  const [temperatureC, setTemperatureC] = useState<number | null>(null);
  const [temperatureF, setTemperatureF] = useState<number | null>(null);
  const [isFahrenheit, setIsFahrenheit] = useState<boolean>(false);
  const [localTime, setLocalTime] = useState<string>("Loading time...");


  const defaultCity = "New York City";
  const defaultCondition = "Patchy light snow";
  const defaultTemperatureC = 27;
  const defaultTemperatureF = (27 * 9) / 5 + 32; // Convert 27°C to °F
  const defaultLocalTime = "12:00 PM"; // Set your default time here
  const defaultIconUrl = "https://cdn.weatherapi.com/weather/64x64/night/323.png";

  const displayCity = city || defaultCity;

  useEffect(() => {
    const fetchWeatherAndTime = async () => {
      try {
        const apiKey = '2316f440769c440d92051647240512';
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(displayCity)}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data && data.current && data.current.condition) {
          const condition = data.current.condition.text;
          let icon = data.current.condition.icon;
          const tempC = data.current.temp_c;
          const tempF = data.current.temp_f;

          // Make sure icon URL is complete
          if (icon.startsWith("//")) {
            icon = `https:${icon}`;
          }

          setWeatherDescription(`It's ${condition.toLowerCase()} in ${displayCity}.`);
          setIconUrl(icon);
          setTemperatureC(tempC);
          setTemperatureF(tempF);
          if (data.location) {
            const latitude = data.location.lat;
            const longitude = data.location.lon;
  
            // Fetch time data using Time API
            const timeResponse = await fetch(
              `https://timeapi.io/api/Time/current/coordinate?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`
            );
  
            if (!timeResponse.ok) {
              throw new Error("Network response was not ok for time data");
            }
  
            const timeData = await timeResponse.json();
  
            if (timeData && timeData.time) {
              setLocalTime(`Local time: ${timeData.time}`);
            } else {
              setLocalTime("Unable to fetch time data.");
            }
          } else {
            setLocalTime("Unable to fetch time data.");
          }  
        } else {
          // Set default values
          setWeatherDescription(`It's ${defaultCondition.toLowerCase()} in ${defaultCity}.`);
          setIconUrl(defaultIconUrl);
          setTemperatureC(defaultTemperatureC);
          setTemperatureF(defaultTemperatureF);
          setLocalTime(`Local time: ${defaultLocalTime}`);
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
        // Set default values
        setWeatherDescription(`It's ${defaultCondition.toLowerCase()} in ${defaultCity}.`);
        setIconUrl(defaultIconUrl);
        setTemperatureC(defaultTemperatureC);
        setTemperatureF(defaultTemperatureF);
        setLocalTime(`Local time: ${defaultLocalTime}`);
      }
    };

    fetchWeatherAndTime();
  }, [displayCity]);

  const toggleTemperatureUnit = () => {
    setIsFahrenheit(!isFahrenheit);
  };

  const temperature = isFahrenheit ? temperatureF : temperatureC;

  return (
    <div>
      <p>{weatherDescription}</p>
      {iconUrl && <img src={iconUrl} alt="Weather Icon" />}
      {temperature !== null && (
        <p>
          Temperature: {temperature?.toFixed(1)}°{isFahrenheit ? "F" : "C"}
        </p>
      )}
      <button onClick={toggleTemperatureUnit}>
        Show in °{isFahrenheit ? "C" : "F"}
      </button>
      {localTime && <p>{localTime}</p>}
    </div>
  );
};
