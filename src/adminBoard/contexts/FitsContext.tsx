/**
 * FITS Data Context
 * 
 * This context provides FITS (Flexible Image Transport System) data management functionality:
 * - Access to latest FITS files
 * - Access to all FITS files
 * - Statistics about FITS files (counts by type, upload dates, etc.)
 * - Data refresh functionality
 * 
 * Includes mock data support for frontend development without a backend.
 */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Fit } from '../types/Fit';
import { fitsService } from '../services/fitsService';

// Mock FITS data for development/testing without backend
const mockFits: Fit[] = [
  {
    id: '1',
    filename: 'observation_20231001.fits',
    filepath: '/data/uploads/observation_20231001.fits',
    date: '2023-10-01T15:30:00Z',
    observer: 'John Smith',
    observer_code: 'JSM',
    status: 'Completed',
    url: '/api/fits/1/download',
    // FITS metadata
    exposure_time: 120.5,
    date_of_observation: '2023-10-01T15:25:30',
    object_name: 'M31',
    filter: 'R',
    ra_of_image: '00h42m44s',
    dec_of_image: '+41d16m09s',
    temp_of_detector: -15.2,
    julian_date: 2460219.14583,
    gain: 1.4,
    airmass: 1.2,
    BITPIX: 16,
    NAXIS1: 1600,
    NAXIS2: 1200,
    XPIXSZ: 9,
    XBINNING: 1,
    YBINNING: 1,
    IMAGETYP: 'Light Frame',
    INSTRUME: 'ZWO ASI294MM Pro',
    CAMNAME: 'ASI294MM Pro',
    WIDTH: 1600,
    HEIGHT: 1200
  },
  {
    id: '2',
    filename: 'observation_20231005.fits',
    filepath: '/data/uploads/observation_20231005.fits',
    date: '2023-10-05T10:15:00Z',
    observer: 'Jane Doe',
    observer_code: 'JDO',
    status: 'Pending',
    url: '/api/fits/2/download',
    // FITS metadata
    exposure_time: 300,
    date_of_observation: '2023-10-05T10:10:00',
    object_name: 'NGC 7293',
    filter: 'Ha',
    ra_of_image: '22h29m38s',
    dec_of_image: '-20d50m14s',
    temp_of_detector: -20.0,
    julian_date: 2460223.92708,
    gain: 2.1,
    airmass: 1.5,
    BITPIX: 16,
    NAXIS1: 3096,
    NAXIS2: 2080,
    XPIXSZ: 5.86,
    XBINNING: 1,
    YBINNING: 1,
    IMAGETYP: 'Light Frame',
    INSTRUME: 'QHY600M',
    CAMNAME: 'QHY600M',
    WIDTH: 3096,
    HEIGHT: 2080
  },
  {
    id: '3',
    filename: 'dark_frame_20231015.fits',
    filepath: '/data/uploads/dark_frame_20231015.fits',
    date: '2023-10-15T20:30:00Z',
    observer: 'John Smith',
    observer_code: 'JSM',
    status: 'Completed',
    url: '/api/fits/4/download',
    // FITS metadata
    exposure_time: 300,
    date_of_observation: '2023-10-15T20:25:00',
    object_name: 'DARK',
    filter: 'None',
    temp_of_detector: -15.0,
    julian_date: 2460234.35417,
    gain: 1.4,
    BITPIX: 16,
    NAXIS1: 1600,
    NAXIS2: 1200,
    XPIXSZ: 9,
    XBINNING: 1,
    YBINNING: 1,
    IMAGETYP: 'Dark Frame',
    INSTRUME: 'ZWO ASI294MM Pro',
    CAMNAME: 'ASI294MM Pro',
    WIDTH: 1600,
    HEIGHT: 1200
  }
];

// Mock statistics data for development/testing
const mockStats = {
  totalFits: 15,
  todaysUploads: 3,
  pendingFits: 2,
  lightFrames: 8,
  darkFrames: 4,
  flatFrames: 2,
  biasFrames: 1
};

/**
 * Interface defining all functions and state available through the FitsContext
 */
interface FitsContextType {
  latestFits: Fit[];            // Latest FITS files (typically most recent 10)
  allFits: Fit[];               // All FITS files in the system
  totalFits: number;            // Total count of FITS files
  todaysUploads: number;        // Count of FITS files uploaded today
  pendingFits: number;          // Count of FITS files with "Pending" status
  isLoading: boolean;           // Loading state for FITS operations
  error: Error | null;          // Error state for FITS operations
  refreshFits: () => Promise<void>; // Function to refresh all FITS data
}

// Create context with undefined default value (will be provided by FitsProvider)
export const FitsContext = createContext<FitsContextType | undefined>(undefined);

// Props interface for FitsProvider component
interface FitsProviderProps {
  children: ReactNode;
}

/**
 * FITS Provider Component
 * 
 * Wraps the application to provide FITS data context to all child components.
 * Manages FITS data state and provides data access functions.
 */
export function FitsProvider({ children }: FitsProviderProps) {
  // State for latest FITS files
  const [latestFits, setLatestFits] = useState<Fit[]>([]);
  // State for all FITS files
  const [allFits, setAllFits] = useState<Fit[]>([]);
  // State for total FITS count
  const [totalFits, setTotalFits] = useState<number>(0);
  // State for today's uploads count
  const [todaysUploads, setTodaysUploads] = useState<number>(0);
  // State for pending FITS count
  const [pendingFits, setPendingFits] = useState<number>(0);
  // Loading state for FITS operations
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Error state for FITS operations
  const [error, setError] = useState<Error | null>(null);
  
  // Flag to use mock data when API is not available
  const [useMockData, setUseMockData] = useState<boolean>(false);

  /**
   * Refresh all FITS data from the API or use mock data
   */
  const refreshFits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (useMockData) {
        // Use mock data when API is not available
        setLatestFits(mockFits);
        setAllFits(mockFits);
        setTotalFits(mockStats.totalFits);
        setTodaysUploads(mockStats.todaysUploads);
        setPendingFits(mockStats.pendingFits);
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch latest FITS files from API
        const latest = await fitsService.getLatestFits();
        setLatestFits(latest);
        
        // Fetch all FITS files from API
        const all = await fitsService.getAllFits();
        setAllFits(all);
        
        // Calculate statistics
        setTotalFits(all.length);
        
        // Count today's uploads
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = all.filter(fit => {
          const fitDate = new Date(fit.date);
          return fitDate >= today;
        }).length;
        setTodaysUploads(todayCount);
        
        // Count pending FITS files
        const pendingCount = all.filter(fit => fit.status === 'Pending').length;
        setPendingFits(pendingCount);
      } catch (err) {
        // Fall back to mock data if API fails
        console.error('API connection failed, falling back to mock data:', err);
        setUseMockData(true);
        
        // Use mock data when API fails
        setLatestFits(mockFits);
        setAllFits(mockFits);
        setTotalFits(mockStats.totalFits);
        setTodaysUploads(mockStats.todaysUploads);
        setPendingFits(mockStats.pendingFits);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch FITS data'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load FITS data on component mount and set up refresh interval
  useEffect(() => {
    refreshFits();
    
    // Set up a polling interval to refresh data
    const intervalId = setInterval(refreshFits, 60000); // Refresh every minute
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Provide FITS context value to children
  return (
    <FitsContext.Provider
      value={{
        latestFits,
        allFits,
        totalFits,
        todaysUploads,
        pendingFits,
        isLoading,
        error,
        refreshFits
      }}
    >
      {children}
    </FitsContext.Provider>
  );
} 