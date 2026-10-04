'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navItems = [
    { icon: '⚡', label: 'Dashboard', path: '/dashboard' },
    { icon: '➕', label: 'New Project', path: '/projects/new' },
  ];

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>⚡</div>
        <div>
          <p style={styles.logoText}>RiskAI</p>
          <p style={styles.logoSubtext}>Smart Prediction</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            style={{
              ...styles.navItem,
              ...(pathname === item.path ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
            {pathname === item.path && <div style={styles.activeIndicator} />}
          </button>
        ))}
      </nav>

      {/* Bottom - User */}
      <div style={styles.bottom}>
        <div style={styles.userCard}>
          <div style={styles.avatar}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user?.fullName}</p>
            <p style={styles.userEmail}>{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: '#1d2125',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid #ffffff10',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
    padding: '0 8px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #0052cc, #0065ff)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    boxShadow: '0 0 20px #0052cc40',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  logoSubtext: {
    fontSize: '11px',
    color: '#8590a2',
    margin: 0,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: '#b6c2cf',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  navItemActive: {
    background: '#1c2b41',
    color: '#579dff',
    border: '1px solid #0052cc30',
  },
  activeIndicator: {
    position: 'absolute',
    right: '12px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#0052cc',
    boxShadow: '0 0 8px #0052cc',
  },
  navIcon: { fontSize: '16px' },
  bottom: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderTop: '1px solid #ffffff15',
    paddingTop: '16px',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    borderRadius: '10px',
    background: '#ffffff08',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0052cc, #0065ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
  },
  userInfo: { overflow: 'hidden' },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#b6c2cf',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '11px',
    color: '#8590a2',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #ffffff15',
    background: 'transparent',
    color: '#a0a0c0',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
};