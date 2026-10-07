
const LoadingSpinner = () => {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '14px',
      padding: '3rem',
    }}>
      <div className="loader" />
      <span style={{ color: 'hsl(220,12%,50%)', fontSize: '0.82rem', fontWeight: 500 }}>Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
