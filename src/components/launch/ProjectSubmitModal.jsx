import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; 
import { toast } from 'react-toastify';
import { submitProject } from '../../api';

const ProjectSubmitModal = ({ tokenDetails, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [website, setWebsite] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [teamDetails, setTeamDetails] = useState([{ name: '', email: '', about: '' }]);

  // Prevent body scrolling and ensure modal stability
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    // Ensure no layout shift by setting explicit viewport height
    document.documentElement.style.setProperty('overflow', 'hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.style.removeProperty('overflow');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate team details
    const validTeamMembers = teamDetails.filter(member => 
      member.name.trim() && member.email.trim()
    );

    if (validTeamMembers.length === 0) {
      toast.error('Please add at least one team member with name and email.');
      setIsSubmitting(false);
      return;
    }

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = validTeamMembers.filter(member => !emailRegex.test(member.email));
    if (invalidEmails.length > 0) {
      toast.error('Please enter valid email addresses for all team members.');
      setIsSubmitting(false);
      return;
    }

    try {
      const projectData = {
        namespace: tokenDetails.contractAddress.split('.')[0],
        moduleName: tokenDetails.contractAddress.split('.')[1],
        tokendetails: {
          SYMBOL: tokenDetails.symbol,
          totalSupply: tokenDetails.supply.int,
          imageUrl: tokenDetails.imageUrl
        },
        team: validTeamMembers
      };
      console.log('Form data before submit:', projectData);
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
    if (teamDetails.length > 1) {
      const updatedTeamDetails = teamDetails.filter((_, i) => i !== index);
      setTeamDetails(updatedTeamDetails);
    }
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    (
      <div 
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000] overscroll-none"
        onClick={handleBackdropClick}
      >
        <div className="bg-card border border-border-color rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="relative h-24 overflow-hidden flex-shrink-0 bg-gradient-primary">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative h-full flex items-center justify-center">
              {tokenDetails?.imageUrl && (
                <img 
                  src={tokenDetails.imageUrl} 
                  alt={tokenDetails.name} 
                  className="w-20 h-20 rounded-xl object-cover border-2 border-white/20"
                />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-accent-primary scrollbar-track-secondary-bg">
            <h3 className="text-2xl font-bold mb-6 text-primary-text text-center">
              Submit Project for Review
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Token Details Display */}
              <div className="card bg-secondary-bg">
                <h4 className="font-semibold text-primary-text mb-3">Token Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-secondary">Name:</span>
                    <span className="text-primary-text ml-2">{tokenDetails?.name}</span>
                  </div>
                  <div>
                    <span className="text-secondary">Symbol:</span>
                    <span className="text-primary-text ml-2">{tokenDetails?.symbol}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-secondary">Contract:</span>
                    <span className="text-primary-text ml-2 font-mono text-xs break-all">
                      {tokenDetails?.contractAddress}
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary">Supply:</span>
                    <span className="text-primary-text ml-2">
                      {tokenDetails?.supply?.int?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Project Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourproject.com"
                    className="w-full bg-secondary-bg text-primary-text p-3 rounded-xl border border-border-color focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Project Description
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe your project, its goals, and what makes it unique..."
                    className="w-full bg-secondary-bg text-primary-text p-3 rounded-xl border border-border-color focus:border-accent-primary focus:outline-none"
                    rows="4"
                    required
                  />
                </div>
              </div>

              {/* Team Details */}
              <div className="card bg-secondary-bg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-primary-text">Team Members</h4>
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="btn btn-ghost text-sm"
                  >
                    + Add Member
                  </button>
                </div>

                <div className="space-y-4">
                  {teamDetails.map((member, index) => (
                    <div key={index} className="p-4 bg-card border border-border-color rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-secondary">
                          Team Member {index + 1}
                        </span>
                        {teamDetails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteTeamMember(index)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                          placeholder="Full Name"
                          className="w-full bg-primary-bg text-primary-text p-3 rounded-lg border border-border-color focus:border-accent-primary focus:outline-none"
                          required
                        />
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                          placeholder="Email Address"
                          className="w-full bg-primary-bg text-primary-text p-3 rounded-lg border border-border-color focus:border-accent-primary focus:outline-none"
                          required
                        />
                        <textarea
                          value={member.about}
                          onChange={(e) => handleTeamMemberChange(index, 'about', e.target.value)}
                          placeholder="Brief bio/background (optional)"
                          className="w-full bg-primary-bg text-primary-text p-3 rounded-lg border border-border-color focus:border-accent-primary focus:outline-none"
                          rows="2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submission Note */}
              <div className="card border-yellow-500/20 bg-yellow-500/5">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-400 text-xl">ℹ️</div>
                  <div>
                    <h4 className="font-semibold text-yellow-400 mb-2">Important Note</h4>
                    <p className="text-sm text-secondary">
                      After your project is approved, you'll be able to configure your sales contract details 
                      including presale phases, pricing, and whitelist settings in the next step.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-current"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit for Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    ),
    document.body
  );
};

export default ProjectSubmitModal;