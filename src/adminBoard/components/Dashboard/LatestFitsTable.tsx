import React, { useState } from 'react';
import { Fit } from '../../types/Fit';
import { fitsService } from '../../services/fitsService';

interface LatestFitsTableProps {
  fits: Fit[];
}

const LatestFitsTable: React.FC<LatestFitsTableProps> = ({ fits }) => {
  const [selectedFit, setSelectedFit] = useState<Fit | null>(null);
  
  const handleDownload = async (fitId: string) => {
    try {
      await fitsService.downloadFit(fitId);
    } catch (error) {
      console.error('Failed to download FIT:', error);
      alert('Failed to download FIT file');
    }
  };

  const handleViewMetadata = async (fitId: string) => {
    try {
      const metadata = await fitsService.getFitMetadata(fitId);
      setSelectedFit(metadata);
    } catch (error) {
      console.error('Failed to get FIT metadata:', error);
      alert('Failed to fetch metadata');
    }
  };

  const closeMetadataModal = () => {
    setSelectedFit(null);
  };

  return (
    <div className="latest-fits-section">
      <h2>Latest FITS Uploads</h2>
      <table className="fits-table">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Date</th>
            <th>Observer</th>
            <th>Object</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fits.length === 0 ? (
            <tr>
              <td colSpan={7}>No FITS data available</td>
            </tr>
          ) : (
            fits.map((fit) => (
              <tr key={fit.id}>
                <td>{fit.filename}</td>
                <td>{new Date(fit.date).toLocaleDateString()}</td>
                <td>{fit.observer}</td>
                <td>{fit.object_name || '-'}</td>
                <td>{fit.IMAGETYP || '-'}</td>
                <td>
                  <span className={`status-${fit.status.toLowerCase()}`}>
                    {fit.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <button 
                    className="metadata-button"
                    onClick={() => handleViewMetadata(fit.id)}
                  >
                    Details
                  </button>
                  <button 
                    className="download-button"
                    onClick={() => handleDownload(fit.id)}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectedFit && (
        <div className="metadata-modal-overlay">
          <div className="metadata-modal">
            <div className="metadata-modal-header">
              <h3>FITS Metadata: {selectedFit.filename}</h3>
              <button className="close-button" onClick={closeMetadataModal}>×</button>
            </div>
            <div className="metadata-modal-body">
              <div className="metadata-grid">
                <div className="metadata-section">
                  <h4>Basic Information</h4>
                  <div className="metadata-item">
                    <span className="metadata-label">Object:</span>
                    <span className="metadata-value">{selectedFit.object_name || '-'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Observer:</span>
                    <span className="metadata-value">{selectedFit.observer}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Observer Code:</span>
                    <span className="metadata-value">{selectedFit.observer_code || '-'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Date of Observation:</span>
                    <span className="metadata-value">{selectedFit.date_of_observation || '-'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Exposure Time:</span>
                    <span className="metadata-value">{selectedFit.exposure_time ? `${selectedFit.exposure_time}s` : '-'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Filter:</span>
                    <span className="metadata-value">{selectedFit.filter || '-'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Image Type:</span>
                    <span className="metadata-value">{selectedFit.IMAGETYP || '-'}</span>
                  </div>
                </div>

                <div className="metadata-section">
                  <h4>Coordinates</h4>
                  <div className="metadata-item">
                    <span className="metadata-label">RA:</span>
                    <span className="metadata-value">{selectedFit.ra_of_image || '-'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">DEC:</span>
                    <span className="metadata-value">{selectedFit.dec_of_image || '-'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Airmass:</span>
                    <span className="metadata-value">{selectedFit.airmass || '-'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Julian Date:</span>
                    <span className="metadata-value">{selectedFit.julian_date || '-'}</span>
                  </div>
                </div>

                <div className="metadata-section">
                  <h4>Instrument</h4>
                  <div className="metadata-item">
                    <span className="metadata-label">Instrument:</span>
                    <span className="metadata-value">{selectedFit.INSTRUME || '-'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Camera:</span>
                    <span className="metadata-value">{selectedFit.CAMNAME || '-'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Detector Temp:</span>
                    <span className="metadata-value">{selectedFit.temp_of_detector ? `${selectedFit.temp_of_detector}°C` : '-'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Gain:</span>
                    <span className="metadata-value">{selectedFit.gain || '-'}</span>
                  </div>
                </div>

                <div className="metadata-section">
                  <h4>Image Properties</h4>
                  <div className="metadata-item">
                    <span className="metadata-label">Dimensions:</span>
                    <span className="metadata-value">{selectedFit.NAXIS1 && selectedFit.NAXIS2 ? `${selectedFit.NAXIS1} × ${selectedFit.NAXIS2}` : '-'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Binning:</span>
                    <span className="metadata-value">{selectedFit.XBINNING && selectedFit.YBINNING ? `${selectedFit.XBINNING} × ${selectedFit.YBINNING}` : '-'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Pixel Size:</span>
                    <span className="metadata-value">{selectedFit.XPIXSZ ? `${selectedFit.XPIXSZ} μm` : '-'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Bit Depth:</span>
                    <span className="metadata-value">{selectedFit.BITPIX ? `${selectedFit.BITPIX}-bit` : '-'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="metadata-modal-footer">
              <button className="download-button" onClick={() => handleDownload(selectedFit.id)}>
                Download FITS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LatestFitsTable; 