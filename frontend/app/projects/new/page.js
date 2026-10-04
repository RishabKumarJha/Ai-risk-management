'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from '../../../components/Sidebar';

const PROJECT_TYPES = [
  { id: 'IT', icon: '💻', label: 'IT', desc: 'Software & technology projects' },
  { id: 'Healthcare', icon: '🏥', label: 'Healthcare', desc: 'Medical & health systems' },
  { id: 'Construction', icon: '🏗️', label: 'Construction', desc: 'Civil & building projects' },
  { id: 'Manufacturing', icon: '🏭', label: 'Manufacturing', desc: 'Production & supply chain' },
  { id: 'Marketing', icon: '📣', label: 'Marketing', desc: 'Campaigns & brand projects' },
  { id: 'R&D', icon: '🔬', label: 'R&D', desc: 'Research & development' },
];

const TYPE_PARAMS = {
  IT: [
    { name: 'methodologyUsed', label: 'Methodology', type: 'select', options: ['Agile','Scrum','Kanban','Waterfall','Hybrid'], icon: '📋' },
    { name: 'teamExperienceLevel', label: 'Team Experience', type: 'select', options: ['Junior','Mixed','Senior','Expert'], icon: '🏆' },
    { name: 'projectManagerExperience', label: 'PM Experience', type: 'select', options: ['Junior PM','Mid-level PM','Senior PM','Certified PM'], icon: '👤' },
    { name: 'teamSize', label: 'Team Size', type: 'number', placeholder: 'e.g. 10', icon: '👥' },
    { name: 'estimatedTimelineMonths', label: 'Timeline (Months)', type: 'number', placeholder: 'e.g. 12', icon: '⏱' },
    { name: 'complexityScore', label: 'Technical Complexity (1-10)', type: 'number', placeholder: 'e.g. 7', min: 1, max: 10, icon: '⚙️' },
    { name: 'budget', label: 'Budget (USD)', type: 'number', placeholder: 'e.g. 500000', icon: '💰' },
    { name: 'priorityLevel', label: 'Priority Level', type: 'select', options: ['Low','Medium','High','Critical'], icon: '🎯' },
  ],
  Healthcare: [
    { name: 'methodologyUsed', label: 'Methodology', type: 'select', options: ['Agile','Scrum','Kanban','Waterfall','Hybrid'], icon: '📋' },
    { name: 'teamExperienceLevel', label: 'Team Experience', type: 'select', options: ['Junior','Mixed','Senior','Expert'], icon: '🏆' },
    { name: 'projectManagerExperience', label: 'PM Experience', type: 'select', options: ['Junior PM','Mid-level PM','Senior PM','Certified PM'], icon: '👤' },
    { name: 'teamSize', label: 'Team Size', type: 'number', placeholder: 'e.g. 10', icon: '👥' },
    { name: 'estimatedTimelineMonths', label: 'Timeline (Months)', type: 'number', placeholder: 'e.g. 12', icon: '⏱' },
    { name: 'complexityScore', label: 'Regulatory Complexity (1-10)', type: 'number', placeholder: 'e.g. 7', min: 1, max: 10, icon: '⚙️' },
    { name: 'budget', label: 'Budget (USD)', type: 'number', placeholder: 'e.g. 500000', icon: '💰' },
    { name: 'priorityLevel', label: 'Priority Level', type: 'select', options: ['Low','Medium','High','Critical'], icon: '🎯' },
  ],
  Construction: [
    { name: 'methodologyUsed', label: 'Project Method', type: 'select', options: ['Agile','Hybrid','Waterfall','Scrum','Kanban'], icon: '📋' },
    { name: 'teamExperienceLevel', label: 'Workforce Experience', type: 'select', options: ['Junior','Mixed','Senior','Expert'], icon: '🏆' },
    { name: 'projectManagerExperience', label: 'Site Manager Experience', type: 'select', options: ['Junior PM','Mid-level PM','Senior PM','Certified PM'], icon: '👤' },
    { name: 'teamSize', label: 'Workforce Size', type: 'number', placeholder: 'e.g. 50', icon: '👷' },
    { name: 'estimatedTimelineMonths', label: 'Project Duration (Months)', type: 'number', placeholder: 'e.g. 24', icon: '⏱' },
    { name: 'complexityScore', label: 'Site Complexity (1-10)', type: 'number', placeholder: 'e.g. 7', min: 1, max: 10, icon: '🏗️' },
    { name: 'budget', label: 'Project Budget (USD)', type: 'number', placeholder: 'e.g. 2000000', icon: '💰' },
    { name: 'priorityLevel', label: 'Priority Level', type: 'select', options: ['Low','Medium','High','Critical'], icon: '🎯' },
  ],
  Manufacturing: [
    { name: 'methodologyUsed', label: 'Production Method', type: 'select', options: ['Agile','Hybrid','Waterfall','Scrum','Kanban'], icon: '📋' },
    { name: 'teamExperienceLevel', label: 'Operator Experience', type: 'select', options: ['Junior','Mixed','Senior','Expert'], icon: '🏆' },
    { name: 'projectManagerExperience', label: 'Plant Manager Experience', type: 'select', options: ['Junior PM','Mid-level PM','Senior PM','Certified PM'], icon: '👤' },
    { name: 'teamSize', label: 'Production Team Size', type: 'number', placeholder: 'e.g. 30', icon: '👥' },
    { name: 'estimatedTimelineMonths', label: 'Production Timeline (Months)', type: 'number', placeholder: 'e.g. 18', icon: '⏱' },
    { name: 'complexityScore', label: 'Process Complexity (1-10)', type: 'number', placeholder: 'e.g. 6', min: 1, max: 10, icon: '⚙️' },
    { name: 'budget', label: 'Production Budget (USD)', type: 'number', placeholder: 'e.g. 1000000', icon: '💰' },
    { name: 'priorityLevel', label: 'Priority Level', type: 'select', options: ['Low','Medium','High','Critical'], icon: '🎯' },
  ],
  Marketing: [
    { name: 'methodologyUsed', label: 'Campaign Method', type: 'select', options: ['Agile','Scrum','Kanban','Hybrid','Waterfall'], icon: '📋' },
    { name: 'teamExperienceLevel', label: 'Team Experience', type: 'select', options: ['Junior','Mixed','Senior','Expert'], icon: '🏆' },
    { name: 'projectManagerExperience', label: 'Campaign Manager Experience', type: 'select', options: ['Junior PM','Mid-level PM','Senior PM','Certified PM'], icon: '👤' },
    { name: 'teamSize', label: 'Campaign Team Size', type: 'number', placeholder: 'e.g. 8', icon: '👥' },
    { name: 'estimatedTimelineMonths', label: 'Campaign Duration (Months)', type: 'number', placeholder: 'e.g. 6', icon: '⏱' },
    { name: 'complexityScore', label: 'Campaign Complexity (1-10)', type: 'number', placeholder: 'e.g. 5', min: 1, max: 10, icon: '⚙️' },
    { name: 'budget', label: 'Campaign Budget (USD)', type: 'number', placeholder: 'e.g. 200000', icon: '💰' },
    { name: 'priorityLevel', label: 'Priority Level', type: 'select', options: ['Low','Medium','High','Critical'], icon: '🎯' },
  ],
  'R&D': [
    { name: 'methodologyUsed', label: 'Research Method', type: 'select', options: ['Agile','Scrum','Hybrid','Kanban','Waterfall'], icon: '📋' },
    { name: 'teamExperienceLevel', label: 'Researcher Experience', type: 'select', options: ['Junior','Mixed','Senior','Expert'], icon: '🏆' },
    { name: 'projectManagerExperience', label: 'Research Lead Experience', type: 'select', options: ['Junior PM','Mid-level PM','Senior PM','Certified PM'], icon: '👤' },
    { name: 'teamSize', label: 'Research Team Size', type: 'number', placeholder: 'e.g. 5', icon: '👥' },
    { name: 'estimatedTimelineMonths', label: 'Research Duration (Months)', type: 'number', placeholder: 'e.g. 36', icon: '⏱' },
    { name: 'complexityScore', label: 'Research Complexity (1-10)', type: 'number', placeholder: 'e.g. 9', min: 1, max: 10, icon: '⚙️' },
    { name: 'budget', label: 'Research Budget (USD)', type: 'number', placeholder: 'e.g. 750000', icon: '💰' },
    { name: 'priorityLevel', label: 'Priority Level', type: 'select', options: ['Low','Medium','High','Critical'], icon: '🎯' },
  ],
};

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mlResult, setMlResult] = useState(null);
  const [groqResult, setGroqResult] = useState(null);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getRiskColor = (risk) => {
    const colors = { Low: '#22c55e', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444' };
    return colors[risk] || '#94a3b8';
  };

  const handleStep1Next = () => {
    if (!formData.projectName.trim()) {
      toast.error('Please enter a project name!');
      return;
    }
    if (!formData.projectType) {
      toast.error('Please select a project type!');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = async () => {
    const params = TYPE_PARAMS[formData.projectType] || [];
    for (const param of params) {
      if (!formData[param.name]) {
        toast.error(`Please fill in ${param.label}!`);
        return;
      }
    }
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

      const groqRes = await axios.post('http://localhost:5000/api/gemini/predict', {
        ...formData,
        teamSize: Number(formData.teamSize),
        estimatedTimelineMonths: Number(formData.estimatedTimelineMonths),
        complexityScore: Number(formData.complexityScore),
        budget: Number(formData.budget),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMlResult(mlRes.data);
      setGroqResult(groqRes.data);
      setStep(3);
      toast.success('Both AI predictions ready!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (result) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/projects', {
        ...formData,
        teamSize: Number(formData.teamSize),
        estimatedTimelineMonths: Number(formData.estimatedTimelineMonths),
        complexityScore: Number(formData.complexityScore),
        budget: Number(formData.budget),
        riskLevel: result.riskLevel,
        riskReason: result.riskReason,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Project saved successfully!');
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err) {
      toast.error('Failed to save project');
    }
  };

  const currentParams = TYPE_PARAMS[formData.projectType] || [];
  const selectedType = PROJECT_TYPES.find(t => t.id === formData.projectType);

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      <Sidebar />

      <div style={styles.main}>
        {/* Navbar */}
        <div style={styles.navbar}>
          <div>
            <h1 style={styles.pageTitle}>New Project</h1>
            <p style={styles.pageSubtitle}>Get dual AI risk predictions in 3 simple steps</p>
          </div>
          <button onClick={() => router.push('/dashboard')} style={styles.backBtn}>
            ← Back to Dashboard
          </button>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressContainer}>
          {[
            { num: 1, label: 'Project Info' },
            { num: 2, label: 'Parameters' },
            { num: 3, label: 'AI Results' },
          ].map((s, i) => (
            <div key={s.num} style={styles.progressStep}>
              <div style={{
                ...styles.progressDot,
                background: step >= s.num ? '#0052cc' : '#dde3f0',
                color: step >= s.num ? '#fff' : '#8590a2',
                boxShadow: step === s.num ? '0 0 0 4px #0052cc20' : 'none',
              }}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span style={{ ...styles.progressLabel, color: step >= s.num ? '#0052cc' : '#8590a2', fontWeight: step === s.num ? '600' : '400' }}>
                {s.label}
              </span>
              {i < 2 && (
                <div style={{ ...styles.progressLine, background: step > s.num ? '#0052cc' : '#dde3f0' }} />
              )}
            </div>
          ))}
        </div>

        {/* STEP 1 - Project Info */}
        {step === 1 && (
          <div className="fade-in">
            <div style={styles.formCard}>
              <h3 style={styles.sectionTitle}>📝 What's your project called?</h3>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Project Name</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="e.g. Hospital Management System"
                  style={{ ...styles.input, fontSize: '16px', padding: '14px 18px' }}
                  autoFocus
                />
              </div>
            </div>

            <div style={styles.formCard}>
              <h3 style={styles.sectionTitle}>🏷️ What type of project is this?</h3>
              <div style={styles.typeGrid}>
                {PROJECT_TYPES.map(type => (
                  <div
                    key={type.id}
                    onClick={() => setFormData({ ...formData, projectType: type.id })}
                    style={{
                      ...styles.typeCard,
                      border: formData.projectType === type.id
                        ? '2px solid #0052cc'
                        : '1px solid #dde3f0',
                      background: formData.projectType === type.id
                        ? '#e8f0fe'
                        : '#ffffff',
                      transform: formData.projectType === type.id ? 'translateY(-2px)' : 'none',
                      boxShadow: formData.projectType === type.id
                        ? '0 8px 24px #0052cc20'
                        : '0 2px 8px #0052cc08',
                    }}
                  >
                    <span style={styles.typeIcon}>{type.icon}</span>
                    <p style={{
                      ...styles.typeLabel,
                      color: formData.projectType === type.id ? '#0052cc' : '#172b4d',
                    }}>
                      {type.label}
                    </p>
                    <p style={styles.typeDesc}>{type.desc}</p>
                    {formData.projectType === type.id && (
                      <div style={styles.typeCheck}>✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleStep1Next} style={styles.nextBtn}>
              Continue to Parameters →
            </button>
          </div>
        )}

        {/* STEP 2 - Parameters */}
        {step === 2 && (
          <div className="fade-in">
            <div style={styles.typeHeaderCard}>
              <span style={styles.typeHeaderIcon}>{selectedType?.icon}</span>
              <div>
                <h3 style={styles.typeHeaderTitle}>{selectedType?.label} Project Parameters</h3>
                <p style={styles.typeHeaderDesc}>Fill in the details specific to your {selectedType?.label} project</p>
              </div>
              <button onClick={() => setStep(1)} style={styles.changeTypeBtn}>
                Change Type
              </button>
            </div>

            <div style={styles.formCard}>
              <div style={styles.grid}>
                {currentParams.map(param => (
                  <div key={param.name} style={styles.inputGroup}>
                    <label style={styles.label}>
                      {param.icon} {param.label}
                    </label>
                    {param.type === 'select' ? (
                      <select
                        name={param.name}
                        value={formData[param.name]}
                        onChange={handleChange}
                        style={styles.input}
                      >
                        <option value="">Select {param.label}</option>
                        {param.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        name={param.name}
                        value={formData[param.name]}
                        onChange={handleChange}
                        placeholder={param.placeholder}
                        min={param.min}
                        max={param.max}
                        style={styles.input}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.stepButtons}>
              <button onClick={() => setStep(1)} style={styles.prevBtn}>
                ← Back
              </button>
              <button onClick={handleStep2Submit} disabled={loading} style={styles.nextBtn}>
                {loading ? (
                  <span style={styles.loadingContent}>
                    <span style={styles.spinner} />
                    Getting AI Predictions...
                  </span>
                ) : '⚡ Get AI Predictions →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 - AI Results */}
        {step === 3 && (
          <div className="fade-in">
            <div style={styles.comparisonGrid}>
              {/* ML Result */}
              <div style={styles.resultCard}>
                <div style={styles.resultHeader}>
                  <div style={styles.resultIconBox}>🤖</div>
                  <div>
                    <h3 style={styles.resultTitle}>ML Model</h3>
                    <p style={styles.resultSubtitle}>Random Forest · 87.81% accuracy</p>
                  </div>
                </div>
                <div style={{
                  ...styles.riskBadgeLarge,
                  background: getRiskColor(mlResult?.riskLevel) + '15',
                  color: getRiskColor(mlResult?.riskLevel),
                  border: `2px solid ${getRiskColor(mlResult?.riskLevel)}40`,
                }}>
                  {mlResult?.riskLevel} Risk
                </div>
                <div style={styles.riskBar}>
                  <div style={{
                    ...styles.riskBarFill,
                    width: mlResult?.riskLevel === 'Low' ? '25%' : mlResult?.riskLevel === 'Medium' ? '50%' : mlResult?.riskLevel === 'High' ? '75%' : '100%',
                    background: getRiskColor(mlResult?.riskLevel),
                  }} />
                </div>
                <p style={styles.reasonText}>{mlResult?.riskReason}</p>
                <button
                  onClick={() => handleSave(mlResult)}
                  style={{ ...styles.saveBtn, background: '#0052cc' }}
                >
                  ✅ Choose ML Prediction
                </button>
              </div>

              {/* Groq Result */}
              <div style={styles.resultCard}>
                <div style={styles.resultHeader}>
                  <div style={styles.resultIconBox}>✨</div>
                  <div>
                    <h3 style={styles.resultTitle}>Groq LLaMA AI</h3>
                    <p style={styles.resultSubtitle}>LLaMA 3.3 70B · Large Language Model</p>
                  </div>
                </div>
                <div style={{
                  ...styles.riskBadgeLarge,
                  background: getRiskColor(groqResult?.riskLevel) + '15',
                  color: getRiskColor(groqResult?.riskLevel),
                  border: `2px solid ${getRiskColor(groqResult?.riskLevel)}40`,
                }}>
                  {groqResult?.riskLevel} Risk
                </div>
                <div style={styles.riskBar}>
                  <div style={{
                    ...styles.riskBarFill,
                    width: groqResult?.riskLevel === 'Low' ? '25%' : groqResult?.riskLevel === 'Medium' ? '50%' : groqResult?.riskLevel === 'High' ? '75%' : '100%',
                    background: getRiskColor(groqResult?.riskLevel),
                  }} />
                </div>
                <p style={styles.reasonText}>{groqResult?.riskReason}</p>
                <button
                  onClick={() => handleSave(groqResult)}
                  style={{ ...styles.saveBtn, background: '#0052cc' }}
                >
                  ✅ Choose Groq Prediction
                </button>
              </div>
            </div>

            {/* Agreement Box */}
            <div style={{
              ...styles.agreementBox,
              borderLeft: `4px solid ${mlResult?.riskLevel === groqResult?.riskLevel ? '#22c55e' : '#f59e0b'}`,
            }}>
              {mlResult?.riskLevel === groqResult?.riskLevel ? (
                <p style={styles.agreementText}>
                  ✅ Both AI systems agree! Risk level is <strong>{mlResult?.riskLevel}</strong>
                </p>
              ) : (
                <p style={styles.disagreementText}>
                  ⚠️ ML says <strong>{mlResult?.riskLevel}</strong>, Groq says <strong>{groqResult?.riskLevel}</strong> — Choose the one you trust more!
                </p>
              )}
            </div>

            <button onClick={() => setStep(2)} style={styles.prevBtn}>
              ← Edit Parameters
            </button>
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
    marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #dde3f0',
  },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#172b4d', margin: 0 },
  pageSubtitle: { fontSize: '14px', color: '#44546f', margin: '4px 0 0' },
  backBtn: {
    padding: '10px 20px', borderRadius: '10px', border: '1px solid #dde3f0',
    background: '#ffffff', color: '#44546f', cursor: 'pointer', fontSize: '13px',
  },
  progressContainer: {
    display: 'flex', alignItems: 'center',
    marginBottom: '32px', padding: '20px 24px',
    background: '#ffffff', borderRadius: '16px',
    border: '1px solid #dde3f0', boxShadow: '0 2px 8px #0052cc08',
  },
  progressStep: {
    display: 'flex', alignItems: 'center', gap: '10px', flex: 1,
  },
  progressDot: {
    width: '32px', height: '32px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: '700', flexShrink: 0,
    transition: 'all 0.3s ease',
  },
  progressLabel: {
    fontSize: '13px', transition: 'all 0.3s ease',
  },
  progressLine: {
    flex: 1, height: '2px', borderRadius: '1px',
    transition: 'background 0.3s ease',
  },
  formCard: {
    background: '#ffffff', borderRadius: '16px', padding: '28px',
    border: '1px solid #dde3f0', boxShadow: '0 2px 8px #0052cc08',
    marginBottom: '20px',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#172b4d', marginBottom: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#172b4d' },
  input: {
    padding: '12px 16px', borderRadius: '8px', border: '1px solid #dde3f0',
    background: '#f8faff', color: '#172b4d', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  typeGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
  },
  typeCard: {
    padding: '20px', borderRadius: '14px', cursor: 'pointer',
    textAlign: 'center', position: 'relative',
    transition: 'all 0.2s ease',
  },
  typeIcon: { fontSize: '36px', display: 'block', marginBottom: '10px' },
  typeLabel: { fontSize: '15px', fontWeight: '600', margin: '0 0 4px' },
  typeDesc: { fontSize: '12px', color: '#8590a2', margin: 0 },
  typeCheck: {
    position: 'absolute', top: '10px', right: '10px',
    width: '20px', height: '20px', borderRadius: '50%',
    background: '#0052cc', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: '700',
  },
  typeHeaderCard: {
    display: 'flex', alignItems: 'center', gap: '16px',
    background: '#e8f0fe', borderRadius: '14px', padding: '20px 24px',
    border: '1px solid #0052cc30', marginBottom: '20px',
  },
  typeHeaderIcon: { fontSize: '36px' },
  typeHeaderTitle: { fontSize: '16px', fontWeight: '600', color: '#0052cc', margin: 0 },
  typeHeaderDesc: { fontSize: '13px', color: '#44546f', margin: '4px 0 0' },
  changeTypeBtn: {
    marginLeft: 'auto', padding: '8px 16px', borderRadius: '8px',
    border: '1px solid #0052cc', background: '#ffffff',
    color: '#0052cc', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  stepButtons: { display: 'flex', gap: '12px', marginTop: '4px' },
  nextBtn: {
    flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
    background: '#0052cc', color: '#fff', fontSize: '15px',
    fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 16px #0052cc30',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  },
  prevBtn: {
    padding: '14px 24px', borderRadius: '12px',
    border: '1px solid #dde3f0', background: '#ffffff',
    color: '#44546f', fontSize: '14px', cursor: 'pointer',
  },
  loadingContent: { display: 'flex', alignItems: 'center', gap: '10px' },
  spinner: {
    width: '16px', height: '16px', borderRadius: '50%',
    border: '2px solid #ffffff40', borderTop: '2px solid #ffffff',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  comparisonGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px',
  },
  resultCard: {
    background: '#ffffff', borderRadius: '16px', padding: '24px',
    border: '1px solid #dde3f0', display: 'flex', flexDirection: 'column', gap: '16px',
    boxShadow: '0 4px 16px #0052cc08',
  },
  resultHeader: { display: 'flex', alignItems: 'center', gap: '12px' },
  resultIconBox: {
    fontSize: '28px', width: '48px', height: '48px',
    background: '#f0f4ff', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  resultTitle: { fontSize: '17px', fontWeight: '600', color: '#172b4d', margin: 0 },
  resultSubtitle: { fontSize: '12px', color: '#8590a2', margin: '2px 0 0' },
  riskBadgeLarge: {
    fontSize: '18px', fontWeight: '700', padding: '12px 24px',
    borderRadius: '12px', textAlign: 'center',
  },
  riskBar: {
    height: '6px', background: '#f0f4ff', borderRadius: '3px', overflow: 'hidden',
  },
  riskBarFill: {
    height: '100%', borderRadius: '3px', transition: 'width 0.5s ease',
  },
  reasonText: { fontSize: '14px', color: '#44546f', lineHeight: '1.7', flex: 1 },
  saveBtn: {
    padding: '13px', borderRadius: '10px', border: 'none',
    color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 12px #0052cc25',
  },
  agreementBox: {
    background: '#ffffff', borderRadius: '12px', padding: '16px 20px',
    border: '1px solid #dde3f0', marginBottom: '20px',
    boxShadow: '0 2px 8px #0052cc08',
  },
  agreementText: { color: '#22c55e', fontSize: '15px', margin: 0, fontWeight: '500' },
  disagreementText: { color: '#f59e0b', fontSize: '15px', margin: 0, fontWeight: '500' },
};