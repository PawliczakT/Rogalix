import React, { createContext, useContext, useState } from 'react';

const YearContext = createContext();

export const YearProvider = ({ children }) => {
  const getInitialYear = () => {
    const saved = localStorage.getItem('selectedYear');
    return saved ? parseInt(saved, 10) : new Date().getFullYear();
  };

  const [year, setYear] = useState(getInitialYear);

  React.useEffect(() => {
    localStorage.setItem('selectedYear', year);
  }, [year]);

  return (
    <YearContext.Provider value={{ year, setYear }}>
      {children}
    </YearContext.Provider>
  );
};

export const useYear = () => useContext(YearContext);
