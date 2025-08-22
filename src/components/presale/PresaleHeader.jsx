import PropTypes from 'prop-types';
import { Rocket } from 'lucide-react';

const PresaleHeader = ({ tokenSymbol }) => {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Rocket className="w-8 h-8 text-accent-primary" />
        <h1 className="text-4xl md:text-5xl font-bold text-gradient">
          {tokenSymbol} Presale
        </h1>
      </div>
      <p className="text-secondary text-lg max-w-2xl mx-auto">
        Join the {tokenSymbol} token presale and be part of the next generation of token Sales on Kadena.
      </p>
    </div>
  );
};

PresaleHeader.propTypes = {
  tokenSymbol: PropTypes.string.isRequired,
};

export default PresaleHeader;
