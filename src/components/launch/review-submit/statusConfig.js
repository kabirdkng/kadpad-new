import { Clock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

export const getStatusInfo = (status) => {
  const statusMap = {
    pending: {
      color: 'yellow',
      icon: Clock,
      title: 'Under Review',
      description: 'Your submission is currently being reviewed by our team.',
      message: 'Our team will review your submission within 48 hours. Please check back later.',
      bgColor: 'bg-yellow-500/5',
      borderColor: 'border-yellow-500/20',
      iconColor: 'text-yellow-400'
    },
    approved: {
      color: 'green',
      icon: CheckCircle,
      title: 'Approved',
      description: 'Your submission has been approved.',
      message: 'Congratulations! Your submission has been approved.',
      bgColor: 'bg-green-500/5',
      borderColor: 'border-green-500/20',
      iconColor: 'text-green-400'
    },
    rejected: {
      color: 'red',
      icon: AlertCircle,
      title: 'Rejected',
      description: 'Your submission needs modifications before approval.',
      message: 'Your submission has been rejected. Please review the feedback and resubmit if necessary.',
      bgColor: 'bg-red-500/5',
      borderColor: 'border-red-500/20',
      iconColor: 'text-red-400'
    },
    awaiting_fees: {
      color: 'blue',
      icon: DollarSign,
      title: 'Awaiting Fees',
      description: 'Please complete the fee payment to proceed.',
      message: 'Your submission has been reviewed. Please pay the required fees to proceed.',
      bgColor: 'bg-blue-500/5',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-400'
    },
    ready_to_launch: {
      color: 'purple',
      icon: CheckCircle,
      title: 'Ready to Launch',
      description: 'Everything is set up and ready for launch.',
      message: 'Your submission has been verified. You are ready to launch!',
      bgColor: 'bg-purple-500/5',
      borderColor: 'border-purple-500/20',
      iconColor: 'text-purple-400'
    },
    launched: {
      color: 'green',
      icon: CheckCircle,
      title: 'Launched',
      description: 'Your token has been successfully launched.',
      message: 'Your project has been successfully launched!',
      bgColor: 'bg-green-500/5',
      borderColor: 'border-green-500/20',
      iconColor: 'text-green-400'
    }
  };
  return statusMap[status] || statusMap.pending;
};
