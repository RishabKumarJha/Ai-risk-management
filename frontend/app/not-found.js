'use client';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoIcon}>⚡</div>
        <h1 style={styles.code}>404</h1>
        <p style={styles.title}>Page not found</p>
        <p style={styles.subtitle}>The page you're looking for doesn't exist or has been moved.</p>
        <button onClick={() => router.push('/dashboard')} style={styles.button}>
          Go to Dashboard
        </button>
        <button onClick={() => router.back()} style={styles.backBtn}>
          ← Go Back
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f0f4ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '60px 48px',
    textAlign: 'center',
    border: '1px solid #dde3f0',
    boxShadow: '0 8px 32px #0052cc15',
    maxWidth: '420px',
    width: '100%',
  },
  logoIcon: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #0052cc, #0065ff)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    margin: '0 auto 24px',
    boxShadow: '0 4px 16px #0052cc30',
  },
  code: {
    fontSize: '80px',
    fontWeight: '800',
    color: '#0052cc',
    margin: '0 0 8px',
    lineHeight: 1,
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#172b4d',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#44546f',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '13px',
    borderRadius: '10px',
    border: 'none',
    background: '#0052cc',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '12px',
    boxShadow: '0 4px 16px #0052cc30',
  },
  backBtn: {
    display: 'block',
    width: '100%',
    padding: '13px',
    borderRadius: '10px',
    border: '1px solid #dde3f0',
    background: 'transparent',
    color: '#44546f',
    fontSize: '14px',
    cursor: 'pointer',
  },
};