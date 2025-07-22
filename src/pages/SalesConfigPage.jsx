import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import useWalletStore from '../wallet/walletStore';
import { toast } from 'react-toastify';

const SalesConfigPage = () => {
  const { namespace, moduleName } = useParams();
  const navigate = useNavigate();
  const { account } = useWalletStore();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    totalTokensToSale: '',
    tokensPerBatch: '',
    phase0price: '',
    phase0startDate: '',
    phase0whitelist: '',
    phase1Price: '',
    phase1StartDate: '',
    salesEndDate: ''
  });

  useEffect(() => {
    fetchProject();
  }, [namespace, moduleName]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchProject = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API}/projects/launched/${namespace}/${moduleName}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setProject(data.data.project);
      } else {
        toast.error('Project not found or not in launched state');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.totalTokensToSale || formData.totalTokensToSale <= 0) {
      errors.push('Total tokens to sale must be greater than 0');
    }
    
    if (!formData.tokensPerBatch || formData.tokensPerBatch <= 0) {
      errors.push('Tokens per batch must be greater than 0');
    }
    
    if (!formData.phase0price || formData.phase0price <= 0) {
      errors.push('Phase 0 price must be greater than 0');
    }
    
    if (!formData.phase1Price || formData.phase1Price <= 0) {
      errors.push('Phase 1 price must be greater than 0');
    }
    
    if (!formData.phase0startDate) {
      errors.push('Phase 0 start date is required');
    }
    
    if (!formData.phase1StartDate) {
      errors.push('Phase 1 start date is required');
    }
    
    if (!formData.salesEndDate) {
      errors.push('Sales end date is required');
    }
    
    // Validate date sequence
    const phase0Date = new Date(formData.phase0startDate);
    const phase1Date = new Date(formData.phase1StartDate);
    const endDate = new Date(formData.salesEndDate);
    const now = new Date();
    
    if (phase0Date < now) {
      errors.push('Phase 0 start date must be in the future');
    }
    
    if (phase1Date <= phase0Date) {
      errors.push('Phase 1 start date must be after Phase 0 start date');
    }
    
    if (endDate <= phase1Date) {
      errors.push('Sales end date must be after Phase 1 start date');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      toast.error('Please connect your wallet');
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setSubmitting(true);

    try {
      // Prepare sales details
      const salesDetails = {
        totalTokensToSale: Number(formData.totalTokensToSale),
        tokensPerBatch: Number(formData.tokensPerBatch),
        phase0price: Number(formData.phase0price),
        phase0startDate: new Date(formData.phase0startDate).toISOString(),
        phase0whitelist: formData.phase0whitelist ? 
          formData.phase0whitelist.split(',').map(addr => addr.trim()).filter(addr => addr) : 
          [],
        phase1Price: Number(formData.phase1Price),
        phase1StartDate: new Date(formData.phase1StartDate).toISOString(),
        salesEndDate: new Date(formData.salesEndDate).toISOString()
      };

      const response = await fetch(`${import.meta.env.VITE_APP_API}/projects/${project._id}/configure-sales`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salesDetails,
          deployerAddress: account
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast.success('Sales configuration completed successfully!');
        navigate(`/presale/${namespace}/${moduleName}`);
      } else {
        throw new Error(data.message || 'Failed to configure sales');
      }
    } catch (error) {
      console.error('Error configuring sales:', error);
      toast.error(error.message || 'Failed to configure sales details');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg text-primary-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-accent-primary mx-auto mb-4"></div>
          <p className="text-secondary">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-primary-bg text-primary-text flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-secondary">The project you're looking for doesn't exist or hasn't been launched yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg text-primary-text py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-card border border-accent-primary/20 mb-6">
            <Calendar className="w-4 h-4 text-accent-primary mr-2" />
            <span className="text-sm font-medium text-accent-primary">
              Configure Sales Details
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-primary-text mb-4">
            Configure Sales for <span className="text-gradient">{project.tokendetails.SYMBOL}</span>
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto mb-8">
            Your project "{project.moduleName}" has been successfully launched! 
            Now configure the sales details to enable public trading.
          </p>

          {/* Project Info Card */}
          <div className="card max-w-2xl mx-auto mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-accent-primary">{project.tokendetails.SYMBOL}</span>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-primary-text">{project.moduleName}</h3>
                <p className="text-secondary">Namespace: {project.namespace}</p>
                <p className="text-secondary">Total Supply: {project.tokendetails.totalSupply.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Configuration Form */}
        <div className="card max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Sales Info */}
            <div>
              <h3 className="text-xl font-bold text-primary-text mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-accent-primary" />
                Basic Sales Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Public Sale Price (KDA per batch)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    name="phase1Price"
                    value={formData.phase1Price}
                    onChange={handleInputChange}
                    placeholder="e.g., 1.0"
                    className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-xl text-primary-text focus:outline-none focus:border-accent-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Public Sale Start Date
                  </label>
                  <input
                    type="datetime-local"
                    name="phase1StartDate"
                    value={formData.phase1StartDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-xl text-primary-text focus:outline-none focus:border-accent-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Sales End Date
                </label>
                <input
                  type="datetime-local"
                  name="salesEndDate"
                  value={formData.salesEndDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-xl text-primary-text focus:outline-none focus:border-accent-primary"
                  required
                />
              </div>
            </div>

            {/* Connected Wallet Info */}
            <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-xl p-6">
              <h4 className="font-semibold text-primary-text mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent-primary" />
                Connected Deployer Account
              </h4>
              <p className="text-secondary font-mono text-sm">
                {account || 'Please connect your wallet'}
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-ghost flex-1 order-2 sm:order-1"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={submitting || !account}
                className={`btn btn-primary flex-1 order-1 sm:order-2 ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                    Configuring...
                  </div>
                ) : (
                  'Configure Sales Details'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center group hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="font-semibold text-primary-text mb-2">Phase Configuration</h4>
            <p className="text-sm text-secondary">
              Set up whitelist and public sale phases with different pricing
            </p>
          </div>

          <div className="card text-center group hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h4 className="font-semibold text-primary-text mb-2">Instant Activation</h4>
            <p className="text-sm text-secondary">
              Once configured, your sales will be immediately available to users
            </p>
          </div>

          <div className="card text-center group hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h4 className="font-semibold text-primary-text mb-2">Secure Process</h4>
            <p className="text-sm text-secondary">
              Only the project deployer can configure sales details
            </p>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 card bg-gradient-card">
          <h3 className="text-xl font-bold text-primary-text mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-primary-text mb-2">Sales Phase Structure</h4>
              <ul className="text-sm text-secondary space-y-2">
                <li>• <strong>Phase 0:</strong> Whitelist sale at lower price</li>
                <li>• <strong>Phase 1:</strong> Public sale at higher price</li>
                <li>• <strong>End Date:</strong> When all sales stop</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary-text mb-2">Best Practices</h4>
              <ul className="text-sm text-secondary space-y-2">
                <li>• Set reasonable time gaps between phases</li>
                <li>• Price Phase 1 higher than Phase 0</li>
                <li>• Consider time zones for your audience</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesConfigPage;