import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  }, []);

  const handleClose = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification.open && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
          <div style={{
            background: notification.severity === 'error' ? '#d32f2f' : notification.severity === 'success' ? '#388e3c' : '#1976d2',
            color: '#fff',
            borderRadius: 8,
            padding: '12px 24px',
            minWidth: 200,
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontWeight: 500,
            fontSize: 16,
          }}
            onClick={handleClose}
          >
            {notification.message}
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
