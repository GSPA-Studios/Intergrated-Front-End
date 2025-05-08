import React, { useState, useEffect } from 'react';
import { useFits } from '../../hooks/useFits';
import { fitsService } from '../../services/fitsService';

const SummaryCards: React.FC = () => {
  const [stats, setStats] = useState({
    totalFits: 0,
    todaysUploads: 0,
    pendingFits: 0,
    lightFrames: 0,
    darkFrames: 0,
    flatFrames: 0,
    biasFrames: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const statsData = await fitsService.getFitsStats();
        setStats(statsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load stats'));
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (loading) {
    return (
      <div className="summary-cards">
        <div className="summary-card loading">
          <h3>Loading stats...</h3>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="summary-cards">
        <div className="summary-card error">
          <h3>Error loading stats</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="summary-cards">
      <div className="summary-card">
        <h3>Total FITS</h3>
        <div className="card-value">{stats.totalFits}</div>
      </div>
      
      <div className="summary-card">
        <h3>Today's Uploads</h3>
        <div className="card-value">{stats.todaysUploads}</div>
      </div>
      
      <div className="summary-card">
        <h3>Pending</h3>
        <div className="card-value">{stats.pendingFits}</div>
      </div>

      <div className="summary-card types-card">
        <h3>Frame Types</h3>
        <div className="frame-types">
          <div className="frame-type">
            <span className="frame-type-label">Light</span>
            <span className="frame-type-value">{stats.lightFrames}</span>
          </div>
          <div className="frame-type">
            <span className="frame-type-label">Dark</span>
            <span className="frame-type-value">{stats.darkFrames}</span>
          </div>
          <div className="frame-type">
            <span className="frame-type-label">Flat</span>
            <span className="frame-type-value">{stats.flatFrames}</span>
          </div>
          <div className="frame-type">
            <span className="frame-type-label">Bias</span>
            <span className="frame-type-value">{stats.biasFrames}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards; 