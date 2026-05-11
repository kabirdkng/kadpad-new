import PropTypes from 'prop-types';

const PhaseIndicator = ({ title, className }) => {
  return (
    <h3 className={`text-xl font-semibold ${className}`}>
      Current Phase: {title}
    </h3>
  );
};

PhaseIndicator.propTypes = {
  title: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired
};

export default PhaseIndicator;
