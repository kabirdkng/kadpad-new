import { Rocket } from 'lucide-react';

const PendingConfiguration = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-500/20 border border-gray-500/30 flex items-center justify-center mx-auto mb-6">
          <Rocket className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-4">
          Sales Configuration Pending
        </h2>
        <div className="card bg-yellow-500/5 border-yellow-500/20 max-w-md mx-auto">
          <p className="text-yellow-400 font-medium mb-2">Waiting for Configuration</p>
          <p className="text-secondary text-sm">
            The admin team needs to configure your sales parameters first.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingConfiguration;
