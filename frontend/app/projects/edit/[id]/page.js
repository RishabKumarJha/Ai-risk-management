'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from '../../../../components/Sidebar';

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: '',
    teamSize: '',
    estimatedTimelineMonths: '',
    complexityScore: '',
    methodologyUsed: '',
    teamExperienceLevel: '',
    budget: '',
    priorityLevel: '',
    projectManagerExperience: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchProject(token);
  }, []);

  const fetchProject = async (token) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const p = res.data;
      setFormData({
        projectName: p.projectName,
        projectType: p.projectType,
        teamSize: p.teamSize,
        estimatedTimelineMonths: p.estimatedTimelineMonths,
        complexityScore: p.complexityScore,
        methodologyUsed: p.methodologyUsed,
        teamExperienceLevel: p.teamExperienceLevel,
        budget: p.budget,
        priorityLevel: p.priorityLevel,
        projectManagerExperience: p.projectManagerExperience,
      });
    } catch (err) {
      toast.error('Failed to load project');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const mlRes = await axios.post('http://localhost:8000/predict', {
        Project_Type: formData.projectType,
        Team_Size: Number(formData.teamSize),
        Estimated_Timeline_Months: Number(formData.estimatedTimelineMonths),
        Complexity_Score: Number(formData.complexityScore),
        Methodology_Used: formData.methodologyUsed,
        Team_Experience_Level: formData.teamExperienceLevel,
        Project_Budget_USD: Number(formData.budget),
        Priority_Level: formData.priorityLevel,
        Project_Manager_Experience: formData.projectManagerExperience,
      });

      const { riskLevel, riskReason } = mlRes.data;

      await axios.put(`http://localhost:5000/api/projects/${id}`, {
        ...formData,
        teamSize: Number(formData.teamSize),
        estimatedTimelineMonths: Number(formData.estimatedTimelineMonths),
        complexityScore: Number(formData.complexityScore),
        budget: Number(formData.budget),
        riskLevel,
        riskReason,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Project updated successfully!');
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={{ height: '40px', width: '300px', marginBottom: '24px' }} className="skeleton" />
        <div style={{ height: '400px', borderRadius: '16px' }} className="skeleton" />
      </div>
    </div>
  );

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
              <span style={styles.breadcrumbCurrent}>Edit Project</span>
            </div>
            <h1 style={styles.pageTitle}>Edit Project</h1>
            <p style={styles.pageSubtitle}>Update details to get a fresh AI risk prediction</p>
          </div>
          <button onClick={() => router.push('/dashboard')} style={styles.backBtn}>
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Project Name */}
          <div style={styles.formCard}>
            <h3 style={styles.sectionTitle}>Project Information</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Project Name</label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Project Parameters */}
          <div style={styles.formCard}>
            <h3 style={styles.sectionTitle}>Project Parameters</h3>
            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Project Type</label>
                <select name="projectType" value={formData.projectType} onChange={handleChange} required style={styles.input}>
                  <option value="">Select type</option>
                  <option>IT</option>
                  <option>Construction</option>
                  <option>Healthcare</option>
                  <option>Manufacturing</option>
                  <option>Marketing</option>
                  <option>R&D</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Priority Level</label>
                <select name="priorityLevel" value={formData.priorityLevel} onChange={handleChange} required style={styles.input}>
                  <option value="">Select priority</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Team Size</label>
                <input type="number" name="teamSize" value={formData.teamSize} onChange={handleChange} required min="1" style={styles.input} />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Timeline (Months)</label>
                <input type="number" name="estimatedTimelineMonths" value={formData.estimatedTimelineMonths} onChange={handleChange} required min="1" style={styles.input} />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Complexity Score (1-10)</label>
                <input type="number" name="complexityScore" value={formData.complexityScore} onChange={handleChange} required min="1" max="10" style={styles.input} />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Budget (USD)</label>
                <input type="number" name="budget" value={formData.budget} onChange={handleChange} required min="0" style={styles.input} />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Methodology Used</label>
                <select name="methodologyUsed" value={formData.methodologyUsed} onChange={handleChange} required style={styles.input}>
                  <option value="">Select methodology</option>
                  <option>Agile</option>
                  <option>Scrum</option>
                  <option>Kanban</option>
                  <option>Waterfall</option>
                  <option>Hybrid</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Team Experience Level</label>
                <select name="teamExperienceLevel" value={formData.teamExperienceLevel} onChange={handleChange} required style={styles.input}>
                  <option value="">Select level</option>
                  <option>Junior</option>
                  <option>Mixed</option>
                  <option>Senior</option>
                  <option>Expert</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Project Manager Experience</label>
                <select name="projectManagerExperience" value={formData.projectManagerExperience} onChange={handleChange} required style={styles.input}>
                  <option value="">Select PM experience</option>
                  <option value="Junior PM">Junior PM</option>
                  <option value="Mid-level PM">Mid-level PM</option>
                  <option value="Senior PM">Senior PM</option>
                  <option value="Certified PM">Certified PM</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? '🔄 Updating & Re-predicting...' : '⚡ Update & Re-predict Risk'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 },
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
  backBtn: {
    padding: '10px 20px', borderRadius: '10px', border: '1px solid #dde3f0',
    background: '#ffffff', color: '#44546f', cursor: 'pointer', fontSize: '13px',
    boxShadow: '0 2px 8px #0052cc08',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' },
  formCard: {
    background: '#ffffff', borderRadius: '16px', padding: '24px',
    border: '1px solid #dde3f0', boxShadow: '0 2px 8px #0052cc08',
  },
  sectionTitle: { fontSize: '15px', fontWeight: '600', color: '#172b4d', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#172b4d' },
  input: {
    padding: '12px 16px', borderRadius: '8px', border: '1px solid #dde3f0',
    background: '#f8faff', color: '#172b4d', fontSize: '14px', outline: 'none',
  },
  button: {
    padding: '14px', borderRadius: '10px', border: 'none',
    background: '#0052cc', color: '#fff', fontSize: '15px',
    fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 16px #0052cc30',
  },
};