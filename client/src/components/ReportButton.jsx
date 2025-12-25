import { useState } from 'react';
import { Flag } from 'lucide-react';
import PropTypes from 'prop-types';

const ReportButton = ({ onReport, variant = 'icon', className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();
    onReport();
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`rounded-lg p-2 transition-colors hover:bg-red-50 ${className}`}
        title="Report this content"
      >
        <Flag
          size={18}
          className={`transition-colors ${
            isHovered ? 'text-red-600' : 'text-gray-500'
          }`}
        />
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600 ${className}`}
      >
        <Flag size={16} />
        <span>Report</span>
      </button>
    );
  }

  // variant === 'button'
  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-red-600 transition-all hover:border-red-300 hover:bg-red-50 ${className}`}
    >
      <Flag size={16} />
      <span>Report</span>
    </button>
  );
};

ReportButton.propTypes = {
  onReport: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['icon', 'text', 'button']),
  className: PropTypes.string,
};

export default ReportButton;
