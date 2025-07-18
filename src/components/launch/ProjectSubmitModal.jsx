import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { submitProject, getPublicProjects } from '../../api';
import { useTokenDetails } from '../../hooks/useTokenDetails';

const ProjectSubmitModal = ({ tokenDetails: initialTokenDetails, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [website, setWebsite] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [teamDetails, setTeamDetails] = useState([]);
  const [status, setStatus] = useState('');

  const { tokenDetails, salesDetails, isLoading, error, fetchTokenDetails, fetchSalesDetails } = useTokenDetails();

  useEffect(() => {
    const fetchDetails = async () => {
      if (initialTokenDetails && initialTokenDetails.contractAddress) {
        await fetchTokenDetails(initialTokenDetails.contractAddress);
        await fetchSalesDetails(initialTokenDetails.contractAddress);
      }
    };
    fetchDetails();
  }, [initialTokenDetails, fetchTokenDetails, fetchSalesDetails]);

  useEffect(() => {
    const checkExistingSubmission = async () => {
      if (tokenDetails && tokenDetails.contractAddress) {
        try {
          const response = await getPublicProjects();
          const existing = response.data.data.projects.find(
            project => project.namespace === tokenDetails.contractAddress.split('.')[0] && project.moduleName === tokenDetails.name
          );
          if (existing) {
            setExistingSubmission(existing);
            setStatus(existing.status);
          }
        } catch (error) {
          console.error('Error checking existing submission:', error);
        }
      }
    };

    checkExistingSubmission();
  }, [tokenDetails]);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (existingSubmission) {
      toast.error('A submission for this contract address already exists.');
      setIsSubmitting(false);
      return;
    }

    try {
      const projectData = {
        namespace: tokenDetails.contractAddress.split('.')[0],
        moduleName: tokenDetails.name,
        tokendetails: {
          SYMBOL: tokenDetails.symbol,
          totalSupply: tokenDetails.supply.int,
          imageUrl: tokenDetails.imageUrl
        },
        salesDetails: {
          totalTokensToSale: salesDetails.totalTokensToSale,
          tokensPerBatch: salesDetails.tokensPerBatch,
          phase0price: salesDetails.phase0price,
          phase0startDate: salesDetails.phase0startDate.toISOString(),
          phase0whitelist: salesDetails.phase0whitelist,
          phase1Price: salesDetails.phase1Price,
          phase1StartDate: salesDetails.phase1StartDate.toISOString(),
          salesEndDate: salesDetails.salesEndDate.toISOString()
        },
        team: teamDetails
      };

      const response = await submitProject(projectData);
      toast.success('Project submitted successfully!');
      onSubmit(response.data);
      onClose();
    } catch (error) {
      console.error('Error submitting project:', error);
      if (error.response && error.response.status === 400) {
        toast.error('Invalid input data or duplicate project. Please check your submission.');
      } else {
        toast.error('Failed to submit project. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeamMemberChange = (index, field, value) => {
    const updatedTeamDetails = [...teamDetails];
    updatedTeamDetails[index] = { ...updatedTeamDetails[index], [field]: value };
    setTeamDetails(updatedTeamDetails);
  };

  const addTeamMember = () => {
    setTeamDetails([...teamDetails, { name: '', email: '', about: '' }]);
  };

  const deleteTeamMember = (index) => {
    const updatedTeamDetails = teamDetails.filter((_, i) => i !== index);
    setTeamDetails(updatedTeamDetails);
  };

  const isValidEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4' style={{ zIndex: 1000 }}>
      <div className='bg-gray-800 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden'>
        <div className='relative h-24 sm:h-32 overflow-hidden flex-shrink-0'>
          <div 
            className='absolute inset-0 bg-cover bg-center blur-sm'
            style={{ backgroundImage: `url(${tokenDetails?.imageUrl})` }}
          ></div>
          <img 
            src={tokenDetails?.imageUrl} 
            alt={tokenDetails?.name} 
            className='absolute inset-0 m-auto h-full w-full object-contain'
          />
        </div>
        <div className='p-6 overflow-y-auto flex-grow'>
          <h3 className='text-xl sm:text-2xl font-bold mb-4 text-white'>Review Details</h3>
          {existingSubmission ? (
            <div className='bg-gray-700 p-3 rounded-md mb-4'>
              <p className='text-white'>Status: {status}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='bg-gray-700 p-3 rounded-md'>
                <label className='block text-sm font-medium text-gray-300 mb-1'>Token Details</label>
                <p className='text-white'>Name: {tokenDetails?.name}</p>
                <p className='text-white'>Symbol: {tokenDetails?.symbol}</p>
                <p className='text-white'>Total Supply: {tokenDetails?.supply.int}</p>
                <p className='text-white'>Contract Address: <span className=' break-words'>{tokenDetails?.contractAddress}</span></p>
              </div>
              <div className='bg-gray-700 p-3 rounded-md'>
                <label className='block text-sm font-medium text-gray-300 mb-1'>Sales Details</label>
                <p className='text-white'>Total Batches to Sale: {salesDetails?.totalTokensToSale}</p>
                <p className='text-white'>Tokens per Batch: {salesDetails?.tokensPerBatch}</p>
                <p className='text-white'>Phase 0 Price: {salesDetails?.phase0price}</p>
                <p className='text-white'>Phase 0 Start Date: {salesDetails?.phase0startDate.toLocaleString()}</p>
                <p className='text-white'>Phase 1 Price: {salesDetails?.phase1Price}</p>
                <p className='text-white'>Phase 1 Start Date: {salesDetails?.phase1StartDate.toLocaleString()}</p>
                <p className='text-white'>Sales End Date: {salesDetails?.salesEndDate.toLocaleString()}</p>
              </div>
              
              <div className='bg-gray-700 p-3 rounded-md'>
                <label className='block text-sm font-medium text-gray-300 mb-1'>Team Details</label>
                {teamDetails.map((member, index) => (
                  <div key={index} className='mb-3'>
                    <input
                      type='text'
                      value={member.name}
                      onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                      placeholder='Name'
                      className='w-full bg-gray-600 text-white p-2 rounded-md mb-2'
                      required
                    />
                    <input
                      type='email'
                      value={member.email}
                      onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                      onBlur={(e) => {
                        if (!isValidEmail(e.target.value)) {
                          toast.error('Please enter a valid email address');
                        }
                      }}
                      placeholder='Email'
                      className='w-full bg-gray-600 text-white p-2 rounded-md mb-2'
                      required
                    />
                    <textarea
                      value={member.about}
                      onChange={(e) => handleTeamMemberChange(index, 'about', e.target.value)}
                      placeholder='About'
                      className='w-full bg-gray-600 text-white p-2 rounded-md mb-2'
                      rows='2'
                    />
                    <button
                      type='button'
                      onClick={() => deleteTeamMember(index)}
                      className='bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm'
                    >
                      Delete Member
                    </button>
                  </div>
                ))}
                <button
                  type='button'
                  onClick={addTeamMember}
                  className='mt-2 bg-gray-600 text-white p-2 rounded-md w-full'
                >
                  Add Team Member
                </button>
              </div>
              <button
                type='submit'
                className='w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-3 px-4 rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Project'}
              </button>
            </form>
          )}
        </div>
        <button
          onClick={onClose}
          className='w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 transition duration-300'
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProjectSubmitModal;