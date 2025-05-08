import { useContext } from 'react';
import { FitsContext } from '../contexts/FitsContext';

export const useFits = () => {
  const context = useContext(FitsContext);
  
  if (context === undefined) {
    throw new Error('useFits must be used within a FitsProvider');
  }
  
  return context;
}; 