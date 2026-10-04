'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Login successful!');
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>⚡</div>
            <span style={styles.logoText}>RiskAI</span>
          </div>
          <h1 style={styles.heroTitle}>
            Predict project risks <span style={styles.heroAccent}>before they happen</span>
          </h1>
          <p style={styles.heroSubtitle}>
            AI-powered risk prediction system that analyzes your project parameters and gives you actionable insights.
          </p>
          <div style={styles.features}>
            {[
              { icon: '🤖', text: 'Dual AI prediction with ML & LLM' },
              { icon: '📊', text: 'Real-time risk analytics & charts' },
              { icon: '🎯', text: '87.81% prediction accuracy' },
              { icon: '⚡', text: 'Instant risk assessment' },
            ].map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Sign in to your RiskAI account</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine} />
          </div>

          <p style={styles.footer}>
            Don't have an account?{' '}
            <Link href="/signup" style={styles.link}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #0052cc 0%, #0065ff 50%, #2684ff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    position: 'relative',
    overflow: 'hidden',
  },
  leftContent: {
    maxWidth: '480px',
    position: 'relative',
    zIndex: 1,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '48px',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  logoText: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
  },
  heroTitle: {
    fontSize: '42px',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: '1.2',
    marginBottom: '20px',
  },
  heroAccent: {
    color: '#a8d4ff',
  },
  heroSubtitle: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: '1.7',
    marginBottom: '40px',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '12px 16px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  featureIcon: { fontSize: '20px' },
  featureText: { fontSize: '14px', color: '#ffffff', fontWeight: '500' },
  rightPanel: {
    width: '480px',
    background: '#f0f4ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  formCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    border: '1px solid #dde3f0',
    boxShadow: '0 8px 32px #0052cc15',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#172b4d',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#44546f',
    marginBottom: '32px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#172b4d' },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #dde3f0',
    background: '#f8faff',
    color: '#172b4d',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  button: {
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    background: '#0052cc',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
    boxShadow: '0 4px 16px #0052cc30',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0',
  },
  dividerLine: { flex: 1, height: '1px', background: '#dde3f0' },
  dividerText: { fontSize: '13px', color: '#8590a2' },
  footer: { textAlign: 'center', fontSize: '14px', color: '#44546f' },
  link: { color: '#0052cc', textDecoration: 'none', fontWeight: '600' },
};