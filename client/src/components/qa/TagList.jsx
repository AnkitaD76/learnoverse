import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './qa-components.css';

/**
 * TagList Component
 * Displays tags as clickable badges
 */
const TagList = ({ tags }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="tag-list">
      {tags.map(tag => (
        <Link
          key={tag._id || tag.name}
          to={`/qa?tag=${tag.name}`}
          className="tag-badge"
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
};

TagList.propTypes = {
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string.isRequired,
    })
  ),
};

export default TagList;
