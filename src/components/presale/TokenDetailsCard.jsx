import PropTypes from 'prop-types';

const TokenDetailsCard = ({ imageUrl, tokenSymbol, tokenName, moduleName }) => {
  return (
    <div className="card mb-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Token Logo */}
        <div className="flex-shrink-0">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={`${tokenSymbol} Logo`}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-accent-primary/20"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-accent-primary/20 bg-accent-primary/10 flex items-center justify-center">
              <span className="text-accent-primary font-bold text-xl">{tokenSymbol?.charAt(0)}</span>
            </div>
          )}
        </div>
        
        {/* Token Info */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-2">
            {tokenName || moduleName} ({tokenSymbol})
          </h2>
        </div>
      </div>
    </div>
  );
};

TokenDetailsCard.propTypes = {
  imageUrl: PropTypes.string,
  tokenSymbol: PropTypes.string.isRequired,
  tokenName: PropTypes.string,
  moduleName: PropTypes.string.isRequired,
};

export default TokenDetailsCard;
