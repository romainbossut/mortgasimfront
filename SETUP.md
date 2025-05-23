# 🚀 Quick Setup Guide

## Environment Configuration

Create a `.env` file in the project root with the following content:

### For Local Development (API on localhost:8000)
```env
VITE_ENV=development
```

### For Production (Using hosted API)
```env
VITE_ENV=production
```

## API Endpoints

The application will automatically use the correct API endpoint based on your environment:

- **Development**: `http://127.0.0.1:8000`
- **Production**: `https://api.mortgasim.com/`

## Testing the Application

1. **Start your local API server** (if using development mode):
   ```bash
   # Your backend API should be running on port 8000
   # Example: python -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```

2. **Start the frontend**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

## API Health Check

The application will show the API status in the top-right corner:
- 🟢 Green dot = API is online and healthy
- 🟡 Yellow dot = Checking API status
- 🔴 Red dot = API is offline or unreachable

## Quick Test

1. Click "Load Sample" to run a simulation with sample data
2. Or fill in the form manually and click "Run Simulation"
3. Charts will appear showing mortgage balance, savings evolution, and net worth over time
4. Click "Export CSV" to download detailed results

## Troubleshooting

### API Connection Issues
- Check that your backend API is running on the correct port
- Verify the CORS settings on your API allow requests from `http://localhost:5173`
- Check browser console for any network errors

### Chart Display Issues
- Ensure Chart.js dependencies are properly installed
- Check that the simulation response includes valid `chart_data`

### Form Validation Errors
- All required fields must be filled
- Numeric fields must contain valid numbers
- Overpayments must follow the format: `month:amount,month:amount`

---

**Need help?** Check the main README.md for detailed documentation. 