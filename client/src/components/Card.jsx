export const Card = ({ children, className = '' }) => {
  return (
    <div className={`rounded-lg bg-white p-6 shadow-md ${className}`}>
      {children}
    </div>
  );
};
