import React from "react"
import {screen, render} from "@testing-library/react"

import {WeatherTime} from "./weather-time";

describe("WeatherTime", () => {
    it("should render the component", () => {
        render(<WeatherTime contentLanguage="en_US" message="World"/>);

        expect(screen.getByText(/Hello World/)).toBeInTheDocument();
    })
})
