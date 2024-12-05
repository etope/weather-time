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

import React, { ReactElement, useState, useEffect, useRef } from "react";
import { BlockAttributes } from "widget-sdk";

/**
 * React Component
 */
export interface WeatherTimeProps extends BlockAttributes {
  city: string;
}

export const WeatherTime = ({ city }: WeatherTimeProps): ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [condition, setCondition] = useState<string>("Loading...");
  const [iconUrl, setIconUrl] = useState<string>("");
  const [temperatureC, setTemperatureC] = useState<number | null>(null);
  const [temperatureF, setTemperatureF] = useState<number | null>(null);
  const [isFahrenheit, setIsFahrenheit] = useState<boolean>(false);
  const [localTime, setLocalTime] = useState<Date | null>(null);

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const defaultCity = "New York City";
  const defaultCondition = "Patchy light snow";
  const defaultTemperatureC = 27;
  const defaultTemperatureF = (27 * 9) / 5 + 32; // Convert 27°C to °F
  const defaultLocalTime = "12:00 PM"; 
  const defaultIconUrl = "https://cdn.weatherapi.com/weather/64x64/night/323.png";
  const defaultFormattedDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const displayCity = city || defaultCity;
  const [formattedDate, setFormattedDate] = useState<string>(defaultFormattedDate);

  const [cityName, setCity] = useState<string>(displayCity);
  const [region, setRegion] = useState<string>("");
  const [country, setCountry] = useState<string>("");

  useEffect(() => {
    const container = containerRef.current;
  
    if (!container) return;
  
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        setIsSmallScreen(width < 400);
      }
    });
  
    observer.observe(container);
  
    // Clean up
    return () => {
      observer.unobserve(container);
    };
  }, []);
  

  useEffect(() => {
    if (localTime) {
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      setFormattedDate(localTime.toLocaleDateString(undefined, options));
    } else {
      setFormattedDate(defaultFormattedDate);
    }
  }, [localTime]);

  useEffect(() => {
    const fetchWeatherAndTime = async () => {
      try {
        const apiKey = '2316f440769c440d92051647240512';
        if (!apiKey) {
          console.error("Weather API key is not set.");
          return;
        }

        console.log("API Key:", apiKey);

        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(displayCity)}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data && data.current && data.current.condition) {
          const conditionText = data.current.condition.text;
          let icon = data.current.condition.icon;
          const tempC = data.current.temp_c;
          const tempF = data.current.temp_f;

          if (icon.startsWith("//")) {
            icon = `https:${icon}`;
          }

          setCondition(conditionText.toLowerCase());
          setIconUrl(icon);
          setTemperatureC(tempC);
          setTemperatureF(tempF);

          // if not US use celsius LOL
          if (data.location && data.location.country) {
            const country = data.location.country;
            setIsFahrenheit(country === "United States of America");
          } else {
            setIsFahrenheit(false);
          }

          if (data.location) {
            const latitude = data.location.lat;
            const longitude = data.location.lon;

            setCity(data.location.name);
            setRegion(data.location.region);
            let countryName = data.location.country;
            if (countryName === "United States of America") {
              countryName = "USA";
            }
            setCountry(countryName);

            // Fetch time data
            const timeResponse = await fetch(
              `https://timeapi.io/api/Time/current/coordinate?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`
            );

            if (!timeResponse.ok) {
              throw new Error("Network response was not ok for time data");
            }

            const timeData = await timeResponse.json();

            if (timeData && timeData.dateTime) {
              const fetchedTime = new Date(timeData.dateTime);
              setLocalTime(fetchedTime);
            } else {
              setLocalTime(null);
            }
          } else {
            setLocalTime(null);
          }
        } else {
          throw new Error("Invalid data received from weather API");
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
        // Set default values
        setCondition(defaultCondition.toLowerCase());
        setIconUrl(defaultIconUrl);
        setTemperatureC(defaultTemperatureC);
        setTemperatureF(defaultTemperatureF);
        setLocalTime(null);
        setIsFahrenheit(false);
        setCity(defaultCity);
        setRegion("");
        setCountry("");
      }
    };

    fetchWeatherAndTime();
  }, [displayCity]);

  useEffect(() => {
    if (!localTime) return;

    const intervalId = setInterval(() => {
      setLocalTime((prevTime) => {
        if (prevTime) {
          return new Date(prevTime.getTime() + 1000);
        } else {
          return prevTime;
        }
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [localTime]);

  const toggleTemperatureUnit = () => {
    setIsFahrenheit((prevIsFahrenheit) => !prevIsFahrenheit);
  };
  const temperature = isFahrenheit ? temperatureF : temperatureC;

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "5px",
      }}
    >
      <div>
        <p
          style={{
            color: "#7ED0FC",
            fontSize: "12px",
            fontStyle: "italic",
            marginBottom: "10px"
          }}
        >
          {cityName}
          {region ? `, ${region}` : ""}
          {country ? `, ${country}` : ""}
        </p>
        <p>
          It's <strong>{condition}</strong> in {cityName}.
        </p>
        {localTime ? (
          <>
            <p
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                marginBottom: "15px",
                marginTop: "15px",
                lineHeight: "25px"
              }}
            >
              {localTime.toLocaleTimeString()}
            </p>
            <p>{formattedDate}</p>
          </>
        ) : (
          <>
            <p
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              {defaultLocalTime}
            </p>
            <p>{formattedDate}</p>
          </>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginLeft: isSmallScreen ? "10px" : "0px",
          flexDirection: isSmallScreen ? "column" : "row",
        }}
      >
        {iconUrl && (
          <div
            style={{
              backgroundColor: "#00A3FD",
              borderRadius: "50%",
              width: isSmallScreen ? "63px" : "80px",
              height: isSmallScreen ? "63px" : "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={iconUrl}
              alt="Weather Icon"
              style={{ width: "50px", height: "50px" }}
            />
          </div>
        )}
        {temperature !== null && (
          <p
            onClick={toggleTemperatureUnit}
            style={{
              cursor: "pointer",
              fontSize: "28px",
              fontWeight: "bold",
              margin: "0",
              marginTop: isSmallScreen ? "10px" : "0",
              marginLeft: isSmallScreen ? "0" : "20px",
            }}
          >
            {temperature?.toFixed(1)}°{isFahrenheit ? "F" : "C"}
          </p>
        )}
      </div>
    </div>
  );
};
