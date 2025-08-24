const TokenInfoCard = ({ tokenDetails }) => {
  if (!tokenDetails) return null;

  return (
    <div className="card bg-secondary-bg mb-4">
      <div className="flex items-center gap-4">
        {tokenDetails.imageUrl && (
          <img
            src={tokenDetails.imageUrl}
            alt={tokenDetails.name}
            className="w-16 h-16 rounded-lg object-cover border border-border-color"
          />
        )}
        <div className="flex-1">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <span className="text-secondary text-xs">Name:</span>
              <span className="ml-2 font-semibold text-primary-text">{tokenDetails.name}</span>
            </div>
            <div>
              <span className="text-secondary text-xs">Symbol:</span>
              <span className="ml-2 font-semibold text-primary-text">{tokenDetails.symbol}</span>
            </div>
            <div>
              <span className="text-secondary text-xs">Supply:</span>
              <span className="ml-2 font-semibold text-primary-text">{tokenDetails.supply?.int?.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-secondary text-xs">Contract:</span>
            <span className="ml-2 font-mono text-xs text-primary-text break-all">{tokenDetails.contractAddress}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenInfoCard;
