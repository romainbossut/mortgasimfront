import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'

// Lazy load page components for code splitting
const MortgageSimulation = React.lazy(() => import('./pages/MortgageSimulation').then(module => ({ default: module.MortgageSimulation })))
const DynamicMortgagePage = React.lazy(() => import('./pages/DynamicMortgagePage').then(module => ({ default: module.DynamicMortgagePage })))

// Loading component for route transitions
const RouteLoading = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '50vh' 
    }}
  >
    <CircularProgress size={60} />
  </Box>
)

function App() {
  return (
    <Router>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          {/* Default home page */}
          <Route path="/" element={<MortgageSimulation />} />
          
          {/* Dynamic mortgage pages with URL slugs */}
          <Route path="/mortgage/:slug" element={<DynamicMortgagePage />} />
          
          {/* Query parameter fallback */}
          <Route path="/mortgage" element={<DynamicMortgagePage />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
