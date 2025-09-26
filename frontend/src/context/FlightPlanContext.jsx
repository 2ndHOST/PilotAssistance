import React, { createContext, useContext, useState } from 'react';

const FlightPlanContext = createContext();

export const FlightPlanProvider = ({ children }) => {
  const [flightPlan, setFlightPlan] = useState({
    origin: '',
    destination: '',
    alternates: [''],
    flightLevel: 'FL350',
  });

  return (
    <FlightPlanContext.Provider value={{ flightPlan, setFlightPlan }}>
      {children}
    </FlightPlanContext.Provider>
  );
};

export const useFlightPlan = () => {
  const context = useContext(FlightPlanContext);
  if (!context) {
    throw new Error('useFlightPlan must be used within a FlightPlanProvider');
  }
  return context;
};

