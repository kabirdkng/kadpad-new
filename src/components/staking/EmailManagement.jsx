import React, { useState } from 'react';
import { Mail, Edit3, Trash2, Bell, BellOff, CheckCircle, X, Save } from 'lucide-react';
import { useStakerEmail } from '../../hooks/useStakerEmail';

const EmailManagement = ({ account, onEmailChange }) => {
  const {
    stakerData,
    isLoading,
    error,
    hasEmail,
    addOrUpdateEmail,
    updateNotifications,
    deleteEmail
  } = useStakerEmail(account);

  const [isEditing, setIsEditing] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize email input when staker data loads
  React.useEffect(() => {
    if (stakerData?.email) {
      setEmailInput(stakerData.email);
    }
  }, [stakerData]);

  // Clear messages after timeout
  React.useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  React.useEffect(() => {
    if (emailError) {
      const timer = setTimeout(() => setEmailError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [emailError]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async () => {
    if (!emailInput.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(emailInput)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setEmailError('');

    try {
      await addOrUpdateEmail(emailInput.trim());
      setSuccessMessage(hasEmail ? 'Email updated successfully!' : 'Email added successfully!');
      setIsEditing(false);
      // Notify parent component about email change
      if (onEmailChange) {
        onEmailChange();
      }
    } catch (err) {
      setEmailError(err.message || 'Failed to save email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationToggle = async () => {
    if (!stakerData) return;

    setIsSubmitting(true);
    try {
      await updateNotifications(!stakerData?.emailNotificationsEnabled);
      setSuccessMessage('Notification preferences updated!');
    } catch (err) {
      setEmailError(err.message || 'Failed to update notification preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmail = async () => {
    if (!window.confirm('Are you sure you want to delete your email? You will no longer receive notifications.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteEmail();
      setSuccessMessage('Email deleted successfully!');
      setEmailInput('');
      setIsEditing(false);
      // Notify parent component about email change
      if (onEmailChange) {
        onEmailChange();
      }
    } catch (err) {
      setEmailError(err.message || 'Failed to delete email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setEmailError('');
    setSuccessMessage('');
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEmailInput(stakerData?.email || '');
    setEmailError('');
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg p-3 lg:p-4 border border-border-color">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-3"></div>
          <div className="h-8 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-3 lg:p-4 border border-border-color">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm lg:text-base font-semibold text-primary-text flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email Notifications
        </h4>
        {!hasEmail && !isEditing && (
          <div className="px-2 py-1 bg-accent/10 rounded-full">
            <span className="text-xs font-medium text-accent">Recommended</span>
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-3 transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-1">
          <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {emailError && (
        <div className="mb-3 transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-1">
          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <X className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-400">{emailError}</span>
          </div>
        </div>
      )}

      {/* Email Management */}
      <div className={`relative overflow-hidden h-auto ${!hasEmail ? 'min-h-[100px]' : 'min-h-[150px]'}`}>
        {/* Email Form - Add/Edit State */}
        <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${
          !hasEmail || isEditing 
            ? 'opacity-100 transform translate-y-0 pointer-events-auto' 
            : 'opacity-0 transform -translate-y-4 pointer-events-none'
        }`}>
          <div className="space-y-3">
            <div>
            <label className="block text-xs text-secondary mb-1">
              {hasEmail ? 'Update Email Address' : 'Add Email Address'}
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-3 py-2 bg-gray-800/50 border border-border-color rounded-md text-sm text-primary-text placeholder-secondary focus:outline-none focus:border-accent transition-all duration-200 focus:shadow-lg focus:shadow-accent/20"
                disabled={isSubmitting}
              />
              <button
                onClick={handleEmailSubmit}
                disabled={isSubmitting || !emailInput.trim()}
                className="px-3 py-2 bg-accent hover:bg-accent/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1 transform hover:scale-[1.02]"
              >
                <Save className="w-3 h-3" />
                {isSubmitting ? '...' : 'Save'}
              </button>
              {isEditing && (
                <button
                  onClick={handleCancelEditing}
                  disabled={isSubmitting}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* Email Display State */}
        <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${
          hasEmail && !isEditing && stakerData
            ? 'opacity-100 transform translate-y-0 pointer-events-auto' 
            : 'opacity-0 transform translate-y-4 pointer-events-none'
        }`}>
          <div className="space-y-3">
          {/* Display Email */}
          <div className="bg-gray-800/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-secondary">Current Email</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleStartEditing}
                  disabled={isSubmitting}
                  className="p-1 text-secondary hover:text-accent transition-all duration-200 transform hover:scale-110"
                  title="Edit email"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDeleteEmail}
                  disabled={isSubmitting}
                  className="p-1 text-secondary hover:text-red-400 transition-all duration-200 transform hover:scale-110"
                  title="Delete email"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="text-sm text-primary-text font-medium">
              {stakerData?.email || 'No email set'}
            </div>
          </div>

          {/* Notification Preferences */}
          {stakerData && (
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-secondary mb-1">Email Notifications</div>
                  <div className="text-sm text-primary-text">
                    {stakerData?.emailNotificationsEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <button
                  onClick={handleNotificationToggle}
                  disabled={isSubmitting}
                  className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                    stakerData?.emailNotificationsEnabled
                      ? 'bg-accent/20 text-accent hover:bg-accent/30'
                      : 'bg-gray-600/50 text-secondary hover:bg-gray-600'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={stakerData?.emailNotificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
                >
                  {stakerData?.emailNotificationsEnabled ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* API Error Display */}
      {error && !emailError && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <span className="text-xs text-red-400">{error}</span>
        </div>
      )}
    </div>
  );
};

export default EmailManagement;
