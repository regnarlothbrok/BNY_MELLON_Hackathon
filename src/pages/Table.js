import React, { useState, useMemo } from 'react';
import { useData } from '../DataContext';

const dummyData = [
  { clientName: "John Doe", bankName: "ABC Bank", accountNumber: "1234567890", transactionDate: "2024-03-15", creditDebit: "Credit", description: "Salary", amount: 5000, balance: 10000 },
  { clientName: "Jane Smith", bankName: "XYZ Bank", accountNumber: "0987654321", transactionDate: "2024-03-16", creditDebit: "Debit", description: "Grocery Shopping", amount: 150, balance: 4850 },
  { clientName: "Alice Johnson", bankName: "PQR Bank", accountNumber: "1357924680", transactionDate: "2024-03-17", creditDebit: "Credit", description: "Refund", amount: 75, balance: 4925 },
  { clientName: "Bob Williams", bankName: "LMN Bank", accountNumber: "2468013579", transactionDate: "2024-03-18", creditDebit: "Debit", description: "Utility Bill", amount: 200, balance: 4725 },
  { clientName: "Eva Brown", bankName: "DEF Bank", accountNumber: "3692581470", transactionDate: "2024-03-19", creditDebit: "Credit", description: "Interest", amount: 10, balance: 4735 },
];

const Table = () => {
  const { tableData, setTableData, isLoading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [editingCell, setEditingCell] = useState(null);

  const displayData = tableData.length > 0 ? tableData : dummyData;

  const sortedAndFilteredData = useMemo(() => {
    let sortableItems = [...displayData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems.filter(transaction =>
      Object.values(transaction).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [displayData, sortConfig, searchTerm]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleEdit = (index, key, value) => {
    const newData = [...displayData];
    newData[index][key] = value;
    setTableData(newData);
    setEditingCell(null);
  };

  const exportToCSV = () => {
    const headers = Object.keys(displayData[0]).join(',');
    const csvData = displayData.map(row => Object.values(row).join(',')).join('\n');
    const csvContent = `${headers}\n${csvData}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'transaction_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: '#f0f8ff', 
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#a2d2ff',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: 'white', 
          marginBottom: '10px' 
        }}>
          Transaction Data
        </h1>
        <input
          type="text"
          placeholder="Search transactions..."
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px',
            borderRadius: '4px',
            border: 'none',
            marginBottom: '10px'
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={exportToCSV}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Export to CSV
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px'
        }}>
          <thead style={{ backgroundColor: '#a2d2ff', color: 'white' }}>
            <tr>
              {Object.keys(displayData[0]).map((key) => (
                <th 
                  key={key}
                  style={{ 
                    padding: '12px', 
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                  onClick={() => requestSort(key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)} ▼
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredData.map((transaction, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                {Object.entries(transaction).map(([key, value]) => (
                  <td key={key} style={{ padding: '12px' }}>
                    {editingCell === `${index}-${key}` ? (
                      <input
                        value={value}
                        onChange={(e) => handleEdit(index, key, e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        autoFocus
                      />
                    ) : (
                      <div onClick={() => setEditingCell(`${index}-${key}`)}>
                        {key === 'creditDebit' ? (
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: value === 'Credit' ? '#d4edda' : '#f8d7da',
                            color: value === 'Credit' ? '#155724' : '#721c24'
                          }}>
                            {value}
                          </span>
                        ) : key === 'amount' ? (
                          <span style={{ color: transaction.creditDebit === 'Credit' ? '#28a745' : '#dc3545' }}>
                            ${value}
                          </span>
                        ) : (
                          value
                        )}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;