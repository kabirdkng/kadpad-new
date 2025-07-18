import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';

const LaunchTokenStep = ({ submissionStatus, namespace, moduleName }) => {
  if (submissionStatus !== 'Verified') {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Launch Your Token</h2>
        <p className="mb-6">You cannot access this step until your submission is verified.</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Rocket className="w-16 h-16 text-lime-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold mb-4">Launch Your Token</h2>
      <p className="mb-6">Congratulations! Your token is now live. Monitor your launch and engage with your community.</p>
      <Link 
        to={`/dashboard/${namespace}/${moduleName}`} 
        className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded transition duration-300"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default LaunchTokenStep;