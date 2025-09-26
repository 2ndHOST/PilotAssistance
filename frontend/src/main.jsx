import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FlightPlanProvider } from './context/FlightPlanContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FlightPlanProvider>
      <App />
    </FlightPlanProvider>
  </StrictMode>,
)
