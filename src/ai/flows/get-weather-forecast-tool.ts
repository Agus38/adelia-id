'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WeatherInputSchema = z.object({
  location: z.string().describe("The city and state, e.g., San Francisco, CA. Or a city name like 'Jakarta'"),
});

const WeatherOutputSchema = z.object({
    location: z.string(),
    temperature: z.number(),
    description: z.string(),
    humidity: z.number(),
    wind_speed: z.number(),
});

export const getWeatherForecast = ai.defineTool(
  {
    name: 'getWeatherForecast',
    description: 'Get the current weather forecast for a given location.',
    inputSchema: WeatherInputSchema,
    outputSchema: z.string().describe('A descriptive string of the weather forecast.'),
  },
  async (input) => {
    const apiKey = '2c22f1e55ce0ba542652c2b4164b47eb';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${input.location}&appid=${apiKey}&units=metric&lang=id`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return `Maaf, saya tidak dapat menemukan data cuaca untuk ${input.location}.`;
      }
      const data = await response.json();
      
      const forecast = {
        location: data.name,
        temperature: data.main.temp,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
      };

      return `Cuaca saat ini di ${forecast.location} adalah ${forecast.description} dengan suhu ${forecast.temperature.toFixed(1)}°C. Kelembapan ${forecast.humidity}% dan kecepatan angin ${forecast.wind_speed} m/s.`;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return 'Maaf, terjadi kesalahan saat mengambil data cuaca.';
    }
  }
);
