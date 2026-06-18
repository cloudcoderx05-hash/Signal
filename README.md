# 🌤️ Weather Dashboard

A modern, responsive weather dashboard application that fetches real-time weather data from the OpenWeatherMap API. Get current weather conditions, 5-day forecasts, hourly predictions, and more!

## Features

✨ **Core Features:**
- 🔍 Search weather by city name
- 📍 Geolocation-based weather (automatic location detection)
- 🌡️ Temperature unit toggle (Celsius/Fahrenheit)
- 📊 Current weather with detailed information
- 📅 5-day forecast
- ⏰ Hourly forecast for the next 24 hours
- 💾 Save favorite cities (local storage)
- 🎨 Beautiful, responsive UI
- ⌨️ Keyboard shortcuts

## Weather Information Displayed

### Current Weather
- Temperature (with feels-like temperature)
- Weather condition with emoji
- Humidity
- Wind speed
- Atmospheric pressure
- Visibility
- Cloud coverage
- Sunrise and sunset times

### Forecasts
- 5-day weather forecast with temperatures and conditions
- Hourly forecast for the next 24 hours (8 data points at 3-hour intervals)

## Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Internet connection
- OpenWeatherMap API key (free tier available)

### Setup Instructions

1. **Get an API Key:**
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate a free API key from the dashboard

2. **Configure the Dashboard:**
   - Open `script.js`
   - Find this line:
     ```javascript
     const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
     ```
   - Replace `YOUR_OPENWEATHERMAP_API_KEY` with your actual API key

3. **Run the Dashboard:**
   - Open `index.html` in your web browser
   - Or use a local server:
     ```bash
     python -m http.server 8000
     # or
     npx http-server
     ```
   - Navigate to `http://localhost:8000`

## Usage

### Search for a City
1. Type a city name in the search box
2. Press Enter or click the Search button
3. Weather data will load automatically

### Use Your Current Location
- Click the 📍 button to fetch weather for your current location
- Browser will request permission to access your location

### Toggle Temperature Units
- Click the °F or °C button to switch between Fahrenheit and Celsius
- All temperatures will update instantly

### Save Cities
- Search for a city
- Click "Ctrl/Cmd + S" or use the save functionality
- Saved cities appear at the bottom of the page
- Click a saved city to view its weather
- Click the × button to remove a saved city

### Keyboard Shortcuts
- **Ctrl/Cmd + S**: Save current city
- **Ctrl/Cmd + G**: Use geolocation
- **Enter**: Search for a city

## API Reference

The dashboard uses the following OpenWeatherMap endpoints:

### Current Weather
```
GET /data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={API_KEY}
```

### Forecast (5 days, 3-hour intervals)
```
GET /data/2.5/forecast?lat={lat}&lon={lon}&units=metric&appid={API_KEY}
```

### Geocoding (City to Coordinates)
```
GET /geo/1.0/direct?q={city}&limit=1&appid={API_KEY}
```

## Project Structure

```
weather-dashboard/
├── index.html        # HTML structure
├── styles.css        # Styling and animations
├── script.js         # JavaScript functionality
└── README.md         # Documentation
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Opera: Full support
- IE 11: Limited support (no geolocation)

## Features Breakdown

### Responsive Design
- Mobile-first approach
- Breakpoints for tablets and desktops
- Touch-friendly interface
- Optimized for all screen sizes

### Data Storage
- Saved cities stored in browser's localStorage
- Persistent across browser sessions
- Data cleared only when browser cache is cleared

### Error Handling
- User-friendly error messages
- Network error handling
- Location permission errors
- Invalid city name handling

### Performance
- Optimized API calls
- Parallel requests for current weather and forecast
- Smooth animations and transitions
- Minimal DOM manipulation

## Customization

### Change Color Scheme
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #3498db;
    --secondary-color: #2c3e50;
    --accent-color: #e74c3c;
    /* ... more variables */
}
```

### Add More Weather Endpoints
Modify `fetchWeatherData()` function in `script.js` to include additional endpoints

### Customize Saved Cities Limit
Edit the maximum saved cities by modifying the save function:
```javascript
if (savedCities.length < MAX_SAVED_CITIES) {
    // save logic
}
```

## API Limitations

- Free tier: 60 calls/minute, 1,000,000 calls/month
- Rate limiting may apply for high-traffic usage
- Some advanced features require paid plans

## Troubleshooting

### API Key Not Working
- Verify you've entered the correct API key
- Check that your free tier hasn't exceeded limits
- Wait a few minutes for the API key to activate

### Geolocation Not Working
- Enable location services in browser settings
- Check browser console for permission errors
- Ensure HTTPS is used (if deployed)

### Weather Not Updating
- Check internet connection
- Verify API key is valid
- Check browser console for errors

## Future Enhancements

- [ ] Multiple city dashboard view
- [ ] Weather alerts and notifications
- [ ] Weather history/trends
- [ ] Air quality index
- [ ] UV index details
- [ ] Pollen forecast
- [ ] Dark mode toggle
- [ ] Weather maps integration
- [ ] Multiple language support
- [ ] Export weather data

## License

This project is open source and available under the MIT License.

## Credits

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons and emojis for weather conditions
- Inspired by modern weather applications

## Support

For issues, questions, or suggestions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check browser console for error messages
4. Create an issue in the repository

---

**Happy weather tracking! ⛅**
