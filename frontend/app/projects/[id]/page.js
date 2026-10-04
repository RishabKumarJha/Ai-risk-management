'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, LineChart, Line, CartesianGrid, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import Sidebar from '../../../components/Sidebar';

export default function ViewProjectPage() {
  const router = useRouter();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState([]);
  const [chartTab, setChartTab] = useState('this');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchData(token);
  }, []);

    const fetchData = async (token) => {
    try {
      const [projectRes, allRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setProject(projectRes.data);
      setAllProjects(allRes.data);
    } catch (err) {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    if (suggestionsLoaded) return;
    setLoadingSuggestions(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/suggestions/generate', {
        projectName: project.projectName,
        projectType: project.projectType,
        teamSize: project.teamSize,
        estimatedTimelineMonths: project.estimatedTimelineMonths,
        complexityScore: project.complexityScore,
        methodologyUsed: project.methodologyUsed,
        teamExperienceLevel: project.teamExperienceLevel,
        budget: project.budget,
        priorityLevel: project.priorityLevel,
        projectManagerExperience: project.projectManagerExperience,
        riskLevel: project.riskLevel,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(res.data.suggestions);
      setSuggestionsLoaded(true);
    } catch (err) {
      toast.error('Failed to load suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const getRiskColor = (risk) => {
    const colors = { Low: '#22c55e', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444' };
    return colors[risk] || '#94a3b8';
  };

  // All Projects Charts Data
  const pieData = Object.entries(
    allProjects.reduce((acc, p) => {
      acc[p.riskLevel] = (acc[p.riskLevel] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const typeRiskData = Object.values(
    allProjects.reduce((acc, p) => {
      if (!acc[p.projectType]) acc[p.projectType] = { type: p.projectType, Low: 0, Medium: 0, High: 0, Critical: 0 };
      acc[p.projectType][p.riskLevel] = (acc[p.projectType][p.riskLevel] || 0) + 1;
      return acc;
    }, {})
  );

  const trendData = [...allProjects]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((p, index) => ({
      name: `P${index + 1}`,
      risk: p.riskLevel === 'Low' ? 1 : p.riskLevel === 'Medium' ? 2 : p.riskLevel === 'High' ? 3 : 4,
    }));

  // This Project Charts Data
  const complexityData = [
    { name: 'Complexity', value: project?.complexityScore || 0, fill: '#0052cc' },
  ];

  const avgBudget = allProjects.length > 0
    ? allProjects.reduce((sum, p) => sum + (p.budget || 0), 0) / allProjects.length
    : 0;

  const avgTeamSize = allProjects.length > 0
    ? allProjects.reduce((sum, p) => sum + (p.teamSize || 0), 0) / allProjects.length
    : 0;

  const avgTimeline = allProjects.length > 0
    ? allProjects.reduce((sum, p) => sum + (p.estimatedTimelineMonths || 0), 0) / allProjects.length
    : 0;

  const comparisonData = [
    {
      metric: 'Team Size',
      'This Project': project?.teamSize || 0,
      'Your Average': Math.round(avgTeamSize),
    },
    {
      metric: 'Timeline',
      'This Project': project?.estimatedTimelineMonths || 0,
      'Your Average': Math.round(avgTimeline),
    },
    {
      metric: 'Complexity',
      'This Project': project?.complexityScore || 0,
      'Your Average': Math.round(avgComplexity()),
    },
  ];

  function avgComplexity() {
    if (allProjects.length === 0) return 0;
    return allProjects.reduce((sum, p) => sum + (p.complexityScore || 0), 0) / allProjects.length;
  }

  const riskFactorsData = [
    { factor: 'Complexity', score: project?.complexityScore * 10 || 0, fill: '#0052cc' },
    { factor: 'Team Size', score: Math.min((project?.teamSize / 30) * 100, 100) || 0, fill: '#8b5cf6' },
    { factor: 'Timeline', score: Math.min((project?.estimatedTimelineMonths / 24) * 100, 100) || 0, fill: '#06b6d4' },
    { factor: 'Budget Risk', score: project?.budget < 100000 ? 80 : project?.budget < 500000 ? 40 : 20, fill: '#f59e0b' },
  ];

  if (loading) return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={{ height: '40px', width: '300px', marginBottom: '24px' }} className="skeleton" />
        <div style={{ height: '200px', borderRadius: '16px', marginBottom: '20px' }} className="skeleton" />
        <div style={{ height: '200px', borderRadius: '16px' }} className="skeleton" />
      </div>
    </div>
  );

  if (!project) return <div style={styles.loading}>Project not found</div>;

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      <Sidebar />

      <div style={styles.main}>
        {/* Navbar */}
        <div style={styles.navbar}>
          <div>
            <div style={styles.breadcrumb}>
              <span onClick={() => router.push('/dashboard')} style={styles.breadcrumbLink}>Dashboard</span>
              <span style={styles.breadcrumbSep}>/</span>
              <span style={styles.breadcrumbCurrent}>{project.projectName}</span>
            </div>
            <h1 style={styles.pageTitle}>{project.projectName}</h1>
            <p style={styles.pageSubtitle}>Created on {new Date(project.createdAt).toLocaleDateString()}</p>
          </div>
          <div style={styles.navActions}>
            <span style={{
              ...styles.riskBadge,
              background: getRiskColor(project.riskLevel) + '15',
              color: getRiskColor(project.riskLevel),
              border: `1px solid ${getRiskColor(project.riskLevel)}40`,
            }}>
              {project.riskLevel} Risk
            </span>
            <button onClick={() => router.push(`/projects/edit/${project._id}`)} style={styles.editBtn}>
              ✏️ Edit Project
            </button>
          </div>
        </div>

        <div style={styles.content} className="fade-in">
          {/* AI Risk Analysis */}
          {project.riskReason && (
            <div style={styles.reasonCard}>
              <div style={styles.reasonHeader}>
                <span style={styles.reasonIcon}>🤖</span>
                <div>
                  <h3 style={styles.reasonTitle}>AI Risk Analysis</h3>
                  <p style={styles.reasonSubtitle}>Powered by Machine Learning & LLM</p>
                </div>
              </div>
              <p style={styles.reasonText}>{project.riskReason}</p>
            </div>
          )}
                    {/* Risk Reduction Suggestions */}
          <div style={styles.suggestionsCard}>
            <div style={styles.suggestionsHeader}>
              <div style={styles.suggestionsHeaderLeft}>
                <span style={styles.suggestionsIcon}>💡</span>
                <div>
                  <h3 style={styles.suggestionsTitle}>Risk Management Suggestions</h3>
                  <p style={styles.suggestionsSubtitle}>AI-powered actionable advice to manage your {project.riskLevel} risk project</p>
                </div>
              </div>
              {!suggestionsLoaded && (
                <button onClick={fetchSuggestions} disabled={loadingSuggestions} style={styles.generateBtn}>
                  {loadingSuggestions ? '🔄 Generating...' : '✨ Generate Suggestions'}
                </button>
              )}
            </div>

            {loadingSuggestions && (
              <div style={styles.suggestionsLoading}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={styles.skeletonSuggestion} className="skeleton" />
                ))}
              </div>
            )}

            {suggestionsLoaded && suggestions.length > 0 && (
              <div style={styles.suggestionsList} className="fade-in">
                {suggestions.map((suggestion, i) => (
                  <div key={i} style={{
                    ...styles.suggestionItem,
                    borderLeft: `3px solid ${
                      i === 0 ? '#0052cc' :
                      i === 1 ? '#8b5cf6' :
                      i === 2 ? '#06b6d4' :
                      i === 3 ? '#f59e0b' : '#22c55e'
                    }`,
                  }}>
                    <p style={styles.suggestionText}>{suggestion}</p>
                  </div>
                ))}

                {/* Disclaimer */}
                <div style={styles.disclaimer}>
                  <span style={styles.disclaimerIcon}>⚠️</span>
                  <p style={styles.disclaimerText}>
                    <strong>Disclaimer:</strong> These suggestions are AI-generated by Groq's LLM based on your project parameters and general project management best practices. They are for guidance purposes only and should be reviewed by a qualified project manager before implementation. RiskAI does not guarantee specific outcomes.
                  </p>
                </div>

                <button onClick={() => { setSuggestionsLoaded(false); setSuggestions([]); fetchSuggestions(); }} style={styles.refreshBtn}>
                  🔄 Regenerate Suggestions
                </button>
              </div>
            )}

            {!suggestionsLoaded && !loadingSuggestions && (
              <div style={styles.suggestionsEmpty}>
                <p style={styles.suggestionsEmptyText}>Click "Generate Suggestions" to get AI-powered risk management advice specific to your project.</p>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div style={styles.detailsCard} className="card-hover"></div>

          {/* Project Details */}
          <div style={styles.detailsCard} className="card-hover">
            <h3 style={styles.sectionTitle}>Project Details</h3>
            <div style={styles.detailsGrid}>
              {[
                { label: 'Project Type', value: project.projectType, icon: '📁' },
                { label: 'Priority Level', value: project.priorityLevel, icon: '🎯' },
                { label: 'Team Size', value: `${project.teamSize} members`, icon: '👥' },
                { label: 'Timeline', value: `${project.estimatedTimelineMonths} months`, icon: '⏱' },
                { label: 'Complexity Score', value: `${project.complexityScore} / 10`, icon: '⚙️' },
                { label: 'Budget', value: `$${project.budget?.toLocaleString()}`, icon: '💰' },
                { label: 'Methodology', value: project.methodologyUsed, icon: '📋' },
                { label: 'Team Experience', value: project.teamExperienceLevel, icon: '🏆' },
                { label: 'PM Experience', value: project.projectManagerExperience, icon: '👤' },
              ].map((item, i) => (
                <div key={i} style={styles.detailItem}>
                  <span style={styles.detailIcon}>{item.icon}</span>
                  <div>
                    <p style={styles.detailLabel}>{item.label}</p>
                    <p style={styles.detailValue}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div style={styles.chartsHeader}>
            <h2 style={styles.chartsTitle}>📊 Risk Analytics</h2>
            <div style={styles.tabContainer}>
              <button
                onClick={() => setChartTab('this')}
                style={{ ...styles.tab, ...(chartTab === 'this' ? styles.tabActive : {}) }}
              >
                📌 This Project
              </button>
              <button
                onClick={() => setChartTab('all')}
                style={{ ...styles.tab, ...(chartTab === 'all' ? styles.tabActive : {}) }}
              >
                📊 All Projects
              </button>
            </div>
          </div>

          {/* This Project Charts */}
          {chartTab === 'this' && (
            <div style={styles.chartsGrid} className="fade-in">
              {/* Complexity Gauge */}
              <div style={styles.chartCard} className="card-hover">
                <h3 style={styles.chartTitle}>Complexity Score</h3>
                <p style={styles.chartSubtitle}>Project complexity out of 10</p>
                <ResponsiveContainer width="100%" height={220}>
                  <RadialBarChart
                    cx="50%" cy="50%"
                    innerRadius="60%" outerRadius="90%"
                    data={[{ value: (project.complexityScore / 10) * 100, fill: getRiskColor(project.riskLevel) }]}
                    startAngle={180} endAngle={0}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <p style={{ textAlign: 'center', fontSize: '28px', fontWeight: '700', color: getRiskColor(project.riskLevel), marginTop: '-40px' }}>
                  {project.complexityScore}/10
                </p>
              </div>

              {/* Risk Factors */}
              <div style={styles.chartCard} className="card-hover">
                <h3 style={styles.chartTitle}>Risk Factor Breakdown</h3>
                <p style={styles.chartSubtitle}>Individual risk contributors (%)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={riskFactorsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#dde3f0" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#44546f', fontSize: 11 }} />
                    <YAxis dataKey="factor" type="category" tick={{ fill: '#44546f', fontSize: 11 }} width={70} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #dde3f0', borderRadius: '8px' }} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {riskFactorsData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Comparison with average */}
              <div style={{ ...styles.chartCard, gridColumn: '1 / -1' }} className="card-hover">
                <h3 style={styles.chartTitle}>This Project vs Your Average</h3>
                <p style={styles.chartSubtitle}>How this project compares to your other projects</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dde3f0" />
                    <XAxis dataKey="metric" tick={{ fill: '#44546f', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#44546f', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #dde3f0', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="This Project" fill="#0052cc" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Your Average" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* All Projects Charts */}
          {chartTab === 'all' && (
            <div style={styles.chartsGrid} className="fade-in">
              {/* Pie Chart */}
              <div style={styles.chartCard} className="card-hover">
                <h3 style={styles.chartTitle}>Risk Distribution</h3>
                <p style={styles.chartSubtitle}>All projects by risk level</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={getRiskColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #dde3f0', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div style={styles.chartCard} className="card-hover">
                <h3 style={styles.chartTitle}>Risk by Project Type</h3>
                <p style={styles.chartSubtitle}>Risk distribution across types</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={typeRiskData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dde3f0" />
                    <XAxis dataKey="type" tick={{ fill: '#44546f', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#44546f', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #dde3f0', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="Low" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Medium" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="High" fill="#f97316" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Critical" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Line Chart */}
              <div style={{ ...styles.chartCard, gridColumn: '1 / -1' }} className="card-hover">
                <h3 style={styles.chartTitle}>Risk Trend Over Time</h3>
                <p style={styles.chartSubtitle}>How your project risks have changed (1=Low, 2=Medium, 3=High, 4=Critical)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dde3f0" />
                    <XAxis dataKey="name" tick={{ fill: '#44546f', fontSize: 11 }} />
                    <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4]} tickFormatter={(v) => ['', 'Low', 'Med', 'High', 'Crit'][v]} tick={{ fill: '#44546f', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #dde3f0', borderRadius: '8px' }} formatter={(value) => ['', 'Low', 'Medium', 'High', 'Critical'][value]} />
                    <Line type="monotone" dataKey="risk" stroke="#0052cc" strokeWidth={2} dot={{ fill: '#0052cc', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 },
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#44546f' },
  main: { marginLeft: '240px', flex: 1, padding: '24px 32px', minHeight: '100vh' },
  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #dde3f0',
  },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  breadcrumbLink: { fontSize: '13px', color: '#0052cc', cursor: 'pointer' },
  breadcrumbSep: { fontSize: '13px', color: '#8590a2' },
  breadcrumbCurrent: { fontSize: '13px', color: '#44546f' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#172b4d', margin: 0 },
  pageSubtitle: { fontSize: '14px', color: '#44546f', margin: '4px 0 0' },
  navActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  riskBadge: { fontSize: '14px', fontWeight: '700', padding: '8px 20px', borderRadius: '20px' },
  editBtn: {
    padding: '10px 20px', borderRadius: '10px', border: 'none',
    background: '#0052cc', color: '#fff', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer',
  },
  content: { display: 'flex', flexDirection: 'column', gap: '20px' },
  reasonCard: {
    background: '#fff', borderRadius: '16px', padding: '24px',
    border: '1px solid #0052cc30', borderLeft: '4px solid #0052cc',
    boxShadow: '0 2px 8px #0052cc10',
  },
  reasonHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  reasonIcon: { fontSize: '28px' },
  reasonTitle: { fontSize: '16px', fontWeight: '600', color: '#172b4d', margin: 0 },
  reasonSubtitle: { fontSize: '12px', color: '#8590a2', margin: 0 },
  reasonText: { fontSize: '14px', color: '#44546f', lineHeight: '1.7' },
  detailsCard: {
    background: '#fff', borderRadius: '16px', padding: '24px',
    border: '1px solid #dde3f0', boxShadow: '0 2px 8px #0052cc08',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#172b4d', marginBottom: '20px' },
  detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  detailItem: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
  detailIcon: { fontSize: '20px', marginTop: '2px' },
  detailLabel: { fontSize: '11px', color: '#8590a2', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' },
  detailValue: { fontSize: '15px', color: '#172b4d', fontWeight: '500', margin: 0 },
  chartsHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  chartsTitle: { fontSize: '20px', fontWeight: '600', color: '#172b4d' },
  tabContainer: {
    display: 'flex', gap: '8px',
    background: '#f0f4ff', borderRadius: '10px', padding: '4px',
    border: '1px solid #dde3f0',
  },
  tab: {
    padding: '8px 16px', borderRadius: '8px', border: 'none',
    background: 'transparent', color: '#44546f', fontSize: '13px',
    fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease',
  },
  tabActive: {
    background: '#ffffff', color: '#0052cc', fontWeight: '600',
    boxShadow: '0 2px 8px #0052cc15',
  },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  chartCard: {
    background: '#fff', borderRadius: '16px', padding: '20px',
    border: '1px solid #dde3f0', boxShadow: '0 2px 8px #0052cc08',
  },
  chartTitle: { fontSize: '15px', fontWeight: '600', color: '#172b4d', marginBottom: '4px' },
  chartSubtitle: { fontSize: '12px', color: '#8590a2', marginBottom: '16px' },
    suggestionsCard: {
    background: '#fff', borderRadius: '16px', padding: '24px',
    border: '1px solid #dde3f0', boxShadow: '0 2px 8px #0052cc08',
  },
  suggestionsHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '20px',
  },
  suggestionsHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  suggestionsIcon: { fontSize: '28px' },
  suggestionsTitle: { fontSize: '16px', fontWeight: '600', color: '#172b4d', margin: 0 },
  suggestionsSubtitle: { fontSize: '12px', color: '#8590a2', margin: '4px 0 0' },
  generateBtn: {
    padding: '10px 20px', borderRadius: '10px', border: 'none',
    background: '#0052cc', color: '#fff', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px #0052cc25',
  },
  suggestionsLoading: { display: 'flex', flexDirection: 'column', gap: '12px' },
  skeletonSuggestion: { height: '60px', borderRadius: '8px' },
  suggestionsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  suggestionItem: {
    padding: '14px 16px', borderRadius: '8px',
    background: '#f8faff', border: '1px solid #dde3f0',
  },
  suggestionText: { fontSize: '14px', color: '#172b4d', lineHeight: '1.6', margin: 0 },
  refreshBtn: {
    padding: '8px 16px', borderRadius: '8px',
    border: '1px solid #dde3f0', background: '#ffffff',
    color: '#44546f', fontSize: '13px', cursor: 'pointer',
    marginTop: '4px', alignSelf: 'flex-start',
  },
  suggestionsEmpty: {
    padding: '20px', borderRadius: '8px',
    background: '#f8faff', border: '1px solid #dde3f0',
    textAlign: 'center',
  },
  suggestionsEmptyText: { fontSize: '14px', color: '#8590a2', margin: 0 },
    disclaimer: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    padding: '12px 16px', borderRadius: '8px',
    background: '#fffbeb', border: '1px solid #f59e0b30',
    marginTop: '4px',
  },
  disclaimerIcon: { fontSize: '16px', flexShrink: 0, marginTop: '2px' },
  disclaimerText: {
    fontSize: '12px', color: '#92400e', lineHeight: '1.6', margin: 0,
  },
};