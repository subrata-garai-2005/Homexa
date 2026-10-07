import { NavLink, useLocation } from "react-router-dom"

const steps = [
  { to: '/profile',         label: 'My Profile',       icon: 'person' },
  { to: '/user/mybookings', label: 'My Bookings',      icon: 'calendar_month' },
  { to: '/accomodation',   label: 'My Properties',    icon: 'home_work' },
];

const ProgressSteps = () => {
  const location = useLocation();

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', gap: '8px',
      padding: '1.25rem 1.5rem',
      background: 'hsla(222,25%,9%,0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid hsla(220,20%,22%,0.6)',
    }}>
      {steps.map(step => {
        const isActive = location.pathname === step.to;
        return (
          <NavLink key={step.to} to={step.to} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '8px 18px',
              borderRadius: '9999px',
              border: `1.5px solid ${isActive ? 'hsl(152,70%,42%)' : 'hsla(220,20%,28%,0.6)'}`,
              background: isActive
                ? 'linear-gradient(135deg, hsl(152,83%,28%,0.3), hsl(152,70%,40%,0.2))'
                : 'transparent',
              color: isActive ? 'hsl(152,70%,50%)' : 'hsl(220,12%,55%)',
              fontSize: '0.83rem', fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.22s ease',
              boxShadow: isActive ? '0 0 12px hsla(152,83%,30%,0.25)' : 'none',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{step.icon}</span>
              {step.label}
            </div>
          </NavLink>
        );
      })}
    </div>
  );
};

export default ProgressSteps;
