import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PostJob = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organizationName: '', organizationDetails: '', title: '', jobMode: 'On-site',
    location: '', industry: '', salary: '', timeLimit: 'Flexible', description: '', requirements: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Publishing job...');
    setLoading(true);
    try {
      await axios.post('/api/jobs', formData, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Job posted successfully!', { id: toastId });
      setTimeout(() => navigate('/my-jobs'), 1500);
    } catch (error) { toast.error('Error posting job.', { id: toastId }); setLoading(false); }
  };

  if (!user || user.role !== 'EMPLOYER') return <div className="alert alert-danger mt-5 text-center">Employers Only</div>;

  return (
    <div className="row justify-content-center py-4">
      <div className="col-md-9">
        <div className="card shadow-lg border-0 bg-body-tertiary" style={{ borderRadius: '1rem' }}>
          <div className="card-body p-5">
            <h2 className="fw-bold mb-4 text-primary">Post a New Opportunity</h2>
            <form onSubmit={handleSubmit} className="row g-4">

              <div className="col-12"><h5 className="fw-bold border-bottom pb-2">🏢 Organization Details</h5></div>
              <div className="col-md-12">
                <label className="form-label fw-bold">Company / Organization Name</label>
                <input type="text" className="form-control" required placeholder="e.g. City Hospital, TechCorp" onChange={e => setFormData({...formData, organizationName: e.target.value})} />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-bold">Organization Overview</label>
                <textarea className="form-control" rows="2" required placeholder="Briefly describe what your organization does..." onChange={e => setFormData({...formData, organizationDetails: e.target.value})}></textarea>
              </div>

              <div className="col-12 mt-5"><h5 className="fw-bold border-bottom pb-2">💼 Role Specifications</h5></div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Job Title</label>
                <input type="text" className="form-control" required placeholder="e.g. Registered Nurse, Product Manager" onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Industry</label>
                <input type="text" className="form-control" required placeholder="e.g. Healthcare, Finance, IT" onChange={e => setFormData({...formData, industry: e.target.value})} />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold">Work Mode</label>
                <select className="form-select" onChange={e => setFormData({...formData, jobMode: e.target.value})}>
                  <option value="On-site">🏢 On-site</option><option value="Remote">🏠 Remote</option><option value="Hybrid">🔄 Hybrid</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Time Limit</label>
                <select className="form-select" onChange={e => setFormData({...formData, timeLimit: e.target.value})}>
                  <option value="Flexible">Flexible / Open</option><option value="1 Month">1 Month</option><option value="Urgent">Urgent (2 Weeks)</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Salary (Fixed/Range)</label>
                <input type="text" className="form-control" required placeholder="e.g. $70,000 - $90,000" onChange={e => setFormData({...formData, salary: e.target.value})} />
              </div>

              <div className="col-md-12">
                <label className="form-label fw-bold">Location</label>
                <input type="text" className="form-control" required placeholder="City, State (or 'Anywhere')" onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>

              <div className="col-12 mt-5"><h5 className="fw-bold border-bottom pb-2">📝 Detailed Description</h5></div>
              <div className="col-md-12">
                <label className="form-label fw-bold">Role Description</label>
                <textarea className="form-control" rows="4" required placeholder="Describe the day-to-day responsibilities..." onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="col-md-12">
                <label className="form-label fw-bold">Requirements / Qualifications</label>
                <textarea className="form-control" rows="3" required placeholder="What skills, degrees, or certifications are needed?" onChange={e => setFormData({...formData, requirements: e.target.value})}></textarea>
              </div>

              <div className="col-12 mt-4">
                <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill fw-bold" disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish Job Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PostJob;