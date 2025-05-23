import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MortgageSimulation } from './pages/MortgageSimulation'
import { DynamicMortgagePage } from './pages/DynamicMortgagePage'

function App() {
  return (
    <Router>
      <Routes>
        {/* Default home page */}
        <Route path="/" element={<MortgageSimulation />} />
        
        {/* Dynamic mortgage pages with URL slugs */}
        <Route path="/mortgage/:slug" element={<DynamicMortgagePage />} />
        
        {/* Query parameter fallback */}
        <Route path="/mortgage" element={<DynamicMortgagePage />} />
      </Routes>
    </Router>
  )
}

export default App
