import React from 'react';
import './SalesProgress.css'; // Assuming CSS is in a separate file

const SalesProgress = ({ totalSales, totalBatches }) => {
  const percentage = (totalSales / totalBatches) * 100;

  return (
    <div className="sales-progress">
      <h4>Total Sales</h4>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
      </div>
      <p>{totalSales}/{totalBatches} Batches Sold</p>
    </div>
  );
};

export default SalesProgress;
