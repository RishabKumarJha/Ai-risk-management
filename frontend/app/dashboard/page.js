'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, low: 0, medium: 0, high: 0, critical: 0 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchProjects(token);
  }, []);

  const fetchProjects = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
      const data = res.data;
      setStats({
        total: data.length,
        low: data.filter(p => p.riskLevel === 'Low').length,
        medium: data.filter(p => p.riskLevel === 'Medium').length,
        high: data.filter(p => p.riskLevel === 'High').length,
        critical: data.filter(p => p.riskLevel === 'Critical').length,
      });
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Project deleted!');
      setProjects(projects.filter(p => p._id !== id));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const getRiskColor = (risk) => {
    const colors = { Low: '#22c55e', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444' };
    return colors[risk] || '#94a3b8';
  };

  const getRiskGlow = (risk) => {
    const glows = { Low: '#22c55e30', Medium: '#f59e0b30', High: '#f9731630', Critical: '#ef444430' };
    return glows[risk] || '#94a3b830';
  };

  const filteredProjects = projects.filter(p =>
    p.projectName.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: 'Total Projects', value: stats.total, color: '#6366f1', glow: '#6366f130', icon: '📁' },
    { label: 'Low Risk', value: stats.low, color: '#22c55e', glow: '#22c55e30', icon: '🟢' },
    { label: 'Medium Risk', value: stats.medium, color: '#f59e0b', glow: '#f59e0b30', icon: '🟡' },
    { label: 'High Risk', value: stats.high, color: '#f97316', glow: '#f9731630', icon: '🟠' },
    { label: 'Critical Risk', value: stats.critical, color: '#ef4444', glow: '#ef444430', icon: '🔴' },
  ];

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      <Sidebar />

      <div style={styles.main}>
        {/* Top Navbar */}
        <div style={styles.navbar}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>Monitor and manage your project risks</p>
          </div>
          <button onClick={() => router.push('/projects/new')} style={styles.newBtn}>
            <span>+</span> New Project
          </button>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid} className="fade-in">
          {statCards.map((stat, i) => (
            <div key={i} style={{ ...styles.statCard, borderTop: `2px solid ${stat.color}`, boxShadow: `0 4px 24px ${stat.glow}` }} className="card-hover">
              <div style={styles.statTop}>
                <span style={styles.statIcon}>{stat.icon}</span>
                <span style={{ ...styles.statValue, color: stat.color }}>{stat.value}</span>
              </div>
              <p style={styles.statLabel}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div style={styles.skeletonGrid}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={styles.skeletonCard} className="skeleton" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={styles.emptyState} className="fade-in">
            <div style={styles.emptyIcon}>📂</div>
            <p style={styles.emptyText}>No projects yet</p>
            <p style={styles.emptySubtext}>Click "New Project" to get started</p>
            <button onClick={() => router.push('/projects/new')} style={styles.emptyBtn}>
              + Create First Project
            </button>
          </div>
        ) : (
          <div style={styles.projectsGrid} className="fade-in">
            {filteredProjects.map(project => (
              <div key={project._id} style={styles.projectCard} className="card-hover">
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitleRow}>
                    <h3 style={styles.cardTitle}>{project.projectName}</h3>
                    <span style={{
                      ...styles.riskBadge,
                      background: getRiskColor(project.riskLevel) + '20',
                      color: getRiskColor(project.riskLevel),
                      border: `1px solid ${getRiskColor(project.riskLevel)}40`,
                      boxShadow: `0 0 12px ${getRiskGlow(project.riskLevel)}`,
                    }}>
                      {project.riskLevel || 'Pending'}
                    </span>
                  </div>
                  <p style={styles.cardDate}>{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>

                {/* Card Info */}
                <div style={styles.cardInfo}>
                  <div style={styles.infoChip}>📁 {project.projectType}</div>
                  <div style={styles.infoChip}>👥 {project.teamSize} members</div>
                  <div style={styles.infoChip}>⏱ {project.estimatedTimelineMonths} months</div>
                  <div style={styles.infoChip}>⚙️ {project.methodologyUsed}</div>
                </div>

                {/* Risk Bar */}
                <div style={styles.riskBar}>
                  <div style={{
                    ...styles.riskBarFill,
                    width: project.riskLevel === 'Low' ? '25%' : project.riskLevel === 'Medium' ? '50%' : project.riskLevel === 'High' ? '75%' : '100%',
                    background: `linear-gradient(90deg, ${getRiskColor(project.riskLevel)}, ${getRiskColor(project.riskLevel)}80)`,
                    boxShadow: `0 0 8px ${getRiskColor(project.riskLevel)}60`,
                  }} />
                </div>

                {/* Card Actions */}
                <div style={styles.cardFooter}>
                  <button onClick={() => router.push(`/projects/${project._id}`)} style={styles.viewBtn}>
                    👁 View
                  </button>
                  <button onClick={() => router.push(`/projects/edit/${project._id}`)} style={styles.editBtn}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => deleteProject(project._id)} style={styles.deleteBtn}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 },
  main: { marginLeft: '240px', flex: 1, padding: '24px 32px', minHeight: '100vh' },
  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #dde3f0',
  },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#172b4d', margin: 0 },
  pageSubtitle: { fontSize: '14px', color: '#44546f', margin: '4px 0 0' },
  newBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 24px', borderRadius: '12px', border: 'none',
    background: '#0052cc',
    color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 24px #0052cc30',
    transition: 'all 0.2s ease',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '16px', marginBottom: '28px',
  },
  statCard: {
    background: '#ffffff',
    borderRadius: '16px', padding: '20px',
    border: '1px solid #dde3f0',
    boxShadow: '0 2px 8px #0052cc10',
  },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  statIcon: { fontSize: '20px' },
  statValue: { fontSize: '32px', fontWeight: '700' },
  statLabel: { fontSize: '12px', color: '#44546f', margin: 0 },
  searchContainer: {
    position: 'relative', marginBottom: '24px',
  },
  searchIcon: {
    position: 'absolute', left: '16px', top: '50%',
    transform: 'translateY(-50%)', fontSize: '16px',
  },
  search: {
    width: '100%', padding: '14px 16px 14px 48px',
    borderRadius: '12px', border: '1px solid #dde3f0',
    background: '#ffffff',
    color: '#172b4d', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s ease',
    boxShadow: '0 2px 8px #0052cc08',
  },
  skeletonGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px',
  },
  skeletonCard: { height: '220px' },
  emptyState: {
    textAlign: 'center', padding: '80px 0',
  },
  emptyIcon: { fontSize: '64px', marginBottom: '16px' },
  emptyText: { fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '8px' },
  emptySubtext: { fontSize: '14px', color: '#606080', marginBottom: '24px' },
  emptyBtn: {
    padding: '12px 24px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  projectsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px',
  },
  projectCard: {
    background: '#ffffff',
    borderRadius: '16px', padding: '20px',
    border: '1px solid #dde3f0',
    display: 'flex', flexDirection: 'column', gap: '14px',
    boxShadow: '0 2px 8px #0052cc08',
  },
  cardHeader: { display: 'flex', flexDirection: 'column', gap: '4px' },
  cardTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#172b4d', margin: 0 },
  cardDate: { fontSize: '11px', color: '#8590a2', margin: 0 },
  riskBadge: {
    fontSize: '11px', fontWeight: '700', padding: '4px 10px',
    borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0,
  },
  cardInfo: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  infoChip: {
    fontSize: '12px', color: '#44546f', padding: '4px 10px',
    borderRadius: '20px', background: '#f0f4ff', border: '1px solid #dde3f0',
  },
  riskBar: {
    height: '4px', background: '#e8f0fe', borderRadius: '2px', overflow: 'hidden',
  },
  riskBarFill: { height: '100%', borderRadius: '2px', transition: 'width 0.5s ease' },
  cardFooter: { display: 'flex', gap: '8px' },
  viewBtn: {
    flex: 1, padding: '8px', borderRadius: '8px',
    border: '1px solid #0052cc40', background: '#e8f0fe',
    color: '#0052cc', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  editBtn: {
    flex: 1, padding: '8px', borderRadius: '8px',
    border: '1px solid #dde3f0', background: 'transparent',
    color: '#44546f', cursor: 'pointer', fontSize: '12px',
    transition: 'all 0.2s ease',
  },
  deleteBtn: {
    padding: '8px 12px', borderRadius: '8px',
    border: '1px solid #ef444430', background: '#ef444410',
    color: '#ef4444', cursor: 'pointer', fontSize: '12px',
    transition: 'all 0.2s ease',
  },
};