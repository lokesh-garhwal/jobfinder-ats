import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [file, setFile] = useState(null);
  const [githubLink, setGithubLink] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/jobs/${id}`).then(res => setJob(res.data));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Please log in."); navigate('/login'); return; }
    if (!file) { toast.error("Please select a PDF."); return; }

    const formData = new FormData();
    formData.append("resume", file);
    if (githubLink) formData.append("githubLink", githubLink);
    if (portfolioLink) formData.append("portfolioLink", portfolioLink);

    setUploading(true);
    const toastId = toast.loading('Submitting application...');

    try {
      await axios.post(`/api/applications/apply/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
      });
      toast.success("Application sent!", { id: toastId });
      navigate('/my-applications');
    } catch (err) { toast.error(err.response?.data || "Error.", { id: toastId }); }
    finally { setUploading(false); }
  };

  if (!job) return <div className="text-center mt-5">Loading...</div>;
  const isLocked = job.status === 'PAUSED' || job.status === 'CLOSED';

  return (
    <div className="row justify-content-center py-4">
      <div className="col-md-9">

        {job.status === 'PAUSED' && (
          <div className="alert alert-warning text-center fw-bold shadow-sm rounded-4 mb-4">
            ⚠️ The employer has temporarily stopped accepting applications for this role.
          </div>
        )}
        {job.status === 'CLOSED' && (
          <div className="alert alert-danger text-center fw-bold shadow-sm rounded-4 mb-4">
            🚫 This job has been closed by the recruiter and is no longer available.
          </div>
        )}

        <div className="card shadow-sm border-0 mb-4 bg-primary text-white rounded-4">
          <div className="card-body p-5">
            <h1 className="fw-bold mb-1">{job.organizationName}</h1>
            <p className="lead opacity-75 mb-4">{job.industry}</p>
          </div>
        </div>

        <div className="card shadow-lg border-0 bg-body-tertiary rounded-4">
          <div className="card-body p-5">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom">
              <h2 className="fw-bold text-primary mb-0">{job.title}</h2>
              <span className="badge bg-primary fs-6 py-2 px-3 rounded-pill">{job.jobMode}</span>
            </div>

            <div className="row mb-5 text-center">
              <div className="col-md-4 border-end"><h6 className="text-muted text-uppercase mb-1">📍 Location</h6><h5 className="fw-bold">{job.location}</h5></div>
              <div className="col-md-4 border-end"><h6 className="text-muted text-uppercase mb-1">💰 Comp</h6><h5 className="fw-bold text-success">{job.salary}</h5></div>
              <div className="col-md-4"><h6 className="text-muted text-uppercase mb-1">⏳ Status</h6><h5 className="fw-bold">{job.status}</h5></div>
            </div>

            <h5 className="fw-bold mt-4">Job Description</h5>
            <p className="text-secondary lh-lg mb-5" style={{ whiteSpace: 'pre-line' }}>{job.description}</p>

            <h5 className="fw-bold">Requirements</h5>
            <div className="p-4 bg-body rounded-3 mb-5 border">
              <p className="mb-0 text-secondary lh-lg" style={{ whiteSpace: 'pre-line' }}>{job.requirements}</p>
            </div>

            {user?.role === 'SEEKER' && (
              <form onSubmit={handleApply} className="p-4 border rounded-4 bg-body shadow-sm">
                <h4 className="fw-bold mb-4 text-center">Submit Your Application</h4>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">LinkedIn / Portfolio URL (Optional)</label>
                    <input type="url" className="form-control" placeholder="https://linkedin.com/in/username" onChange={e => setPortfolioLink(e.target.value)} disabled={isLocked} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Additional Link (Optional)</label>
                    <input type="url" className="form-control" placeholder="https://github.com or website" onChange={e => setGithubLink(e.target.value)} disabled={isLocked} />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Upload Resume (PDF)</label>
                  <input type="file" className="form-control form-control-lg" accept="application/pdf" required onChange={e => setFile(e.target.files[0])} disabled={isLocked} />
                </div>

                <button type="submit" className={`btn btn-lg w-100 rounded-pill fw-bold ${isLocked ? 'btn-secondary' : 'btn-primary'}`} disabled={uploading || isLocked}>
                  {job.status === 'PAUSED' ? 'Applications Paused' : job.status === 'CLOSED' ? 'Job Closed' : (uploading ? 'Submitting...' : 'Confirm Application')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default JobDetails;