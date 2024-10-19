import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <DataContext.Provider value={{ tableData, setTableData, isLoading, setIsLoading }}>
      {children}
    </DataContext.Provider>
  );
};