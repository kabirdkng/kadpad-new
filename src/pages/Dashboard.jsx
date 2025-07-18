import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ManageSales from './ManageSales';
import AccessTresury from './AccessTresury';
import usePresaleStore from '../store/usePresaleStore';

const Dashboard = () => {
  const { namespace, moduleName } = useParams();
  const { phase0startTime, phase1startTime, salesEndTime } = usePresaleStore();
  const [showOption, setShowOption] = useState(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const options = [
    { optionName: "Manage Sales", action: "manageSales" },
    { optionName: "Access Treasury", action: "accessTreasury" }
  ];

  useEffect(() => {
    const now = new Date().getTime();
    let targetDate;

    if (now < phase0startTime.getTime()) {
      targetDate = phase0startTime;
    } else if (now < phase1startTime.getTime()) {
      targetDate = phase1startTime;
    } else if (now < salesEndTime.getTime()) {
      targetDate = salesEndTime;
    }

    const intervalId = setInterval(() => {
      setCountdown(calculateCountdown(targetDate.getTime()));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [phase0startTime, phase1startTime, salesEndTime]);

  const calculateCountdown = (endTime) => {
    const now = new Date().getTime();
    const remainingTime = endTime - now;
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const handleOptionClick = (action) => {
    setShowOption(action);
  };

  const renderOption = () => {
    switch (showOption) {
      case 'manageSales':
        return <ManageSales namespace={namespace} moduleName={moduleName} />;
      case 'accessTreasury':
        return <AccessTresury namespace={namespace} moduleName={moduleName} />;
      default:
        return null;
    }
  };

  const now = new Date();
  const isPreWl = now < phase0startTime;
  const isPhase0 = now >= phase0startTime && now < phase1startTime;
  const isPhase1 = now >= phase1startTime && now < salesEndTime;

  return (
    <div className='deployer-panel'>
      <h3>Deployer Dashboard</h3>
      <div className='countdown-container'>
        <p>
          {isPreWl ? "Whitelist Starts in" : 
           isPhase0 ? "Public Sale Starts In" : 
           isPhase1 ? "Public Sale Ends in" : 
           "Sale Ended"}
        </p>
        <div className="countdown">
          <p>{countdown.days}d : {countdown.hours}h : {countdown.minutes}m : {countdown.seconds}s</p>
        </div>
      </div>
      <div className='deployer-options'>
        {options.map((option, index) => (
          <div key={index}>
            <button 
              className="btn-primary col-12" 
              onClick={() => handleOptionClick(option.action)}
            >
              {option.optionName}
            </button>
          </div>
        ))}
      </div>
      {showOption && renderOption()}
    </div>
  );
};

export default Dashboard;