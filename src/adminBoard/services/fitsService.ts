/**
 * FITS Data Service
 * 
 * Provides access to FITS (Flexible Image Transport System) data:
 * - Fetching FITS files (latest, all, by ID)
 * - Downloading FITS files
 * - Getting FITS statistics
 * - Processing FITS data
 * 
 * Includes mock data implementation for frontend development without backend.
 */
import { Fit } from '../types/Fit';

// Base API URL - would be configured from environment in a real app
const API_URL = '/api';

// Mock FITS data for development/testing
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

// Development mode flag - set to true if API is unavailable
const USE_MOCK_DATA = true;

/**
 * Service for handling FITS data operations
 * Provides both API and mock data implementations
 */
export const fitsService = {
  /**
   * Get the latest 10 FITS entries
   * Returns array of most recent FITS files
   */
  getLatestFits: async (): Promise<Fit[]> => {
    if (USE_MOCK_DATA) {
      console.log('Using mock FITS data');
      return mockFits;
    }

    try {
      const response = await fetch(`${API_URL}/fits/latest`, {
        credentials: 'include' // Send cookies for session-based auth
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch latest FITS');
      }
      
      const data = await response.json();
      
      // Ensure all required fields are present
      return data.map((fit: any) => ({
        id: fit.id || '',
        filename: fit.filename || '',
        filepath: fit.filepath || '',
        date: fit.date_of_observation || new Date().toISOString(),
        observer: fit.observer_code || 'Unknown',
        status: fit.status || 'Completed',
        url: fit.url || '',
        // All other FITS metadata fields
        ...fit
      }));
    } catch (error) {
      console.error('Error fetching latest FITS:', error);
      console.log('Falling back to mock data');
      return mockFits;
    }
  },
  
  /**
   * Get all FITS entries
   * Returns array of all FITS files in the system
   */
  getAllFits: async (): Promise<Fit[]> => {
    if (USE_MOCK_DATA) {
      console.log('Using mock FITS data');
      return mockFits;
    }

    try {
      const response = await fetch(`${API_URL}/fits`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch all FITS');
      }
      
      const data = await response.json();
      
      // Ensure all required fields are present
      return data.map((fit: any) => ({
        id: fit.id || '',
        filename: fit.filename || '',
        filepath: fit.filepath || '',
        date: fit.date_of_observation || new Date().toISOString(),
        observer: fit.observer_code || 'Unknown',
        status: fit.status || 'Completed',
        url: fit.url || '',
        // All other FITS metadata fields
        ...fit
      }));
    } catch (error) {
      console.error('Error fetching all FITS:', error);
      console.log('Falling back to mock data');
      return mockFits;
    }
  },
  
  /**
   * Get FITS statistics
   * Returns counts of various FITS data categories
   */
  getFitsStats: async (): Promise<{
    totalFits: number;
    todaysUploads: number;
    pendingFits: number;
    lightFrames: number;
    darkFrames: number;
    flatFrames: number;
    biasFrames: number;
  }> => {
    if (USE_MOCK_DATA) {
      console.log('Using mock FITS stats');
      return mockStats;
    }

    try {
      const response = await fetch(`${API_URL}/fits/stats`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch FITS statistics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching FITS statistics:', error);
      console.log('Falling back to mock stats');
      return mockStats;
    }
  },
  
  /**
   * Download a specific FITS file
   * Opens the file in a new browser tab/window
   */
  downloadFit: async (fitId: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      console.log('Mock download for FITS file', fitId);
      return Promise.resolve();
    }

    try {
      // This opens the file in a new tab/window
      window.open(`${API_URL}/fits/${fitId}/download`, '_blank');
      return Promise.resolve();
    } catch (error) {
      console.error(`Error downloading FITS ${fitId}:`, error);
      throw error;
    }
  },

  /**
   * Get metadata for a specific FITS file
   * Returns detailed information about a single FITS file
   */
  getFitMetadata: async (fitId: string): Promise<Fit | null> => {
    if (USE_MOCK_DATA) {
      console.log('Using mock FITS metadata for', fitId);
      const mockFit = mockFits.find(fit => fit.id === fitId);
      return mockFit || null;
    }

    try {
      const response = await fetch(`${API_URL}/fits/${fitId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch FITS metadata for ${fitId}`);
      }
      
      const data = await response.json();
      
      // Transform API response to match our Fit type
      return {
        id: data.id || '',
        filename: data.filename || '',
        filepath: data.filepath || '',
        date: data.date_of_observation || new Date().toISOString(),
        observer: data.observer_code || 'Unknown',
        status: data.status || 'Completed',
        url: data.url || '',
        // All other FITS metadata fields
        ...data
      };
    } catch (error) {
      console.error(`Error fetching FITS metadata for ${fitId}:`, error);
      // In development mode, return a mock fit
      if (USE_MOCK_DATA) {
        const mockFit = mockFits.find(fit => fit.id === fitId);
        return mockFit || null;
      }
      return null;
    }
  },
  
  /**
   * Upload a new FITS file
   * Returns ID of the newly created FITS file
   */
  uploadFit: async (file: File, metadata: Partial<Fit>): Promise<string | null> => {
    if (USE_MOCK_DATA) {
      console.log('Mock upload for FITS file', file.name);
      // In mock mode, just return a fake ID
      return `mock_${Date.now()}`;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add metadata fields
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      const response = await fetch(`${API_URL}/fits/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload FITS file');
      }
      
      const data = await response.json();
      return data.id || null;
    } catch (error) {
      console.error('Error uploading FITS file:', error);
      return null;
    }
  },
  
  /**
   * Search FITS files by various criteria
   * Returns array of FITS files matching the search parameters
   */
  searchFits: async (params: {
    query?: string;
    observer?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    type?: string;
  }): Promise<Fit[]> => {
    if (USE_MOCK_DATA) {
      console.log('Mock search for FITS files with params:', params);
      
      // Simple filtering of mock data
      return mockFits.filter(fit => {
        // Filter by query (filename)
        if (params.query && !fit.filename.toLowerCase().includes(params.query.toLowerCase())) {
          return false;
        }
        
        // Filter by observer
        if (params.observer && fit.observer !== params.observer) {
          return false;
        }
        
        // Filter by date range
        if (params.dateFrom) {
          const dateFrom = new Date(params.dateFrom);
          const fitDate = new Date(fit.date);
          if (fitDate < dateFrom) {
            return false;
          }
        }
        
        if (params.dateTo) {
          const dateTo = new Date(params.dateTo);
          const fitDate = new Date(fit.date);
          if (fitDate > dateTo) {
            return false;
          }
        }
        
        // Filter by status
        if (params.status && fit.status !== params.status) {
          return false;
        }
        
        // Filter by type (IMAGETYP)
        if (params.type && fit.IMAGETYP !== params.type) {
          return false;
        }
        
        return true;
      });
    }

    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
      
      const response = await fetch(`${API_URL}/fits/search?${queryParams.toString()}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to search FITS files');
      }
      
      const data = await response.json();
      
      // Ensure all required fields are present
      return data.map((fit: any) => ({
        id: fit.id || '',
        filename: fit.filename || '',
        filepath: fit.filepath || '',
        date: fit.date_of_observation || new Date().toISOString(),
        observer: fit.observer_code || 'Unknown',
        status: fit.status || 'Completed',
        url: fit.url || '',
        // All other FITS metadata fields
        ...fit
      }));
    } catch (error) {
      console.error('Error searching FITS files:', error);
      console.log('Falling back to mock data');
      return mockFits;
    }
  }
}; 