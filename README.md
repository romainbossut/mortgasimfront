# 🏠 Mortgage Simulation Frontend

A modern React TypeScript application for simulating mortgage payments, savings growth, and net worth over time. This frontend connects to the [Mortgage Simulation API](https://api.mortgasim.com/) to provide comprehensive financial projections.

## ✨ Features

- **Interactive Form**: Easy-to-use form for entering mortgage and savings parameters
- **Real-time Charts**: Beautiful Chart.js visualizations showing:
  - Balance evolution (mortgage balance, savings balance, net worth)
  - Monthly payment breakdown (payments, interest, principal)
- **Summary Statistics**: Key metrics including final balances, minimum savings, and payoff dates
- **Sample Data**: Load sample scenarios for quick testing
- **CSV Export**: Download simulation results for further analysis
- **API Health Monitoring**: Real-time status of the backend API
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mortgasimfront
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file and configure it:
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your settings:
   ```env
   # For local development with API running on localhost:8000
   VITE_ENV=development
   
   # For production with the hosted API
   VITE_ENV=production
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to view the application.

## 🔧 Configuration

### Environment Variables

The application automatically switches between development and production API endpoints:

- **Development**: `http://127.0.0.1:8000` (local API server)
- **Production**: `https://api.mortgasim.com/` (hosted API)

### API Endpoints Used

- `GET /` - Health check
- `POST /simulate` - Run mortgage simulation
- `GET /simulate/sample` - Get sample request data
- `POST /simulate/csv` - Export results as CSV

## 📊 How to Use

### 1. **Fill in Mortgage Details**
- Mortgage amount (£)
- Term in years (max 40)
- Fixed rate percentage
- Fixed term in months
- Variable rate after fixed period
- Optional: Maximum payment after fixed period

### 2. **Configure Savings Parameters**
- Initial savings balance
- Monthly contribution amount
- Savings interest rate

### 3. **Set Simulation Parameters**
- Typical monthly payment
- Property value
- Years to show after mortgage payoff
- Optional: Overpayment schedule

### 4. **Run Simulation**
Click "Run Simulation" to see:
- Month-by-month projections
- Interactive charts
- Summary statistics
- Warnings and recommendations

### 5. **Export Results**
Click "Export CSV" to download detailed results for Excel analysis.

## 🎯 Overpayment Format

Overpayments should be entered in the format: `month:amount,month:amount`

Examples:
- `18:20000` - £20,000 overpayment in month 18
- `18:20000,24:15000` - £20,000 in month 18 and £15,000 in month 24
- `12:5000,24:5000,36:5000` - £5,000 every 12 months

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Chart.js + react-chartjs-2** - Data visualization
- **React Hook Form + Zod** - Form handling and validation
- **React Query** - API state management
- **Axios** - HTTP client

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── MortgageForm.tsx    # Main simulation form
│   ├── MortgageCharts.tsx  # Chart visualizations
│   └── Button.tsx          # Button component
├── pages/              # Page components
│   └── MortgageSimulation.tsx # Main simulation page
├── services/           # API services
│   └── mortgageApi.ts     # Mortgage API client
├── types/              # TypeScript type definitions
│   └── mortgage.ts        # API response types
├── utils/              # Utility functions
│   └── validation.ts      # Form validation schemas
└── main.tsx           # Application entry point
```

## 🌐 API Documentation

The application connects to the Mortgage Simulation API. For detailed API documentation, see the OpenAPI specification in `mortgagesim.json`.

Key features of the API:
- Comprehensive mortgage and savings simulation
- Fixed-rate period followed by variable rate
- Overpayment handling with savings deduction
- Savings growth with interest compounding
- Payment constraints and feasibility checks
- Net worth calculation including property value

## 🚀 Deployment

### Production Build

```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### Environment Configuration

For production deployment, ensure the environment is configured correctly:

- Set `VITE_ENV=production` to use the hosted API
- The application will automatically use `https://api.mortgasim.com/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using React + TypeScript + Vite**
