import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchJobs = () => {
    axios.get('/api/jobs/my-jobs', { headers: { Authorization: `Bearer ${user.token}` }})
      .then(res => setJobs(res.data)).catch(err => console.log(err));
  };

  useEffect(() => {
    if (!user || user.role !== 'EMPLOYER') { navigate('/'); return; }
    fetchJobs();
  }, [user, navigate]);

  const viewApplicants = async (jobId) => {
    try {
      const res = await axios.get(`/api/applications/job/${jobId}`, { headers: { Authorization: `Bearer ${user.token}` } });
      const sortedApps = res.data.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
      setApplicants(sortedApps);
      setSelectedJob(jobId);
    } catch (err) { toast.error("Failed to fetch applicants"); }
  };

  const updateJobStatus = async (jobId, status) => {
    try {
      await axios.patch(`/api/jobs/${jobId}/status?status=${status}`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success(`Job marked as ${status}`);
      fetchJobs();
    } catch (err) { toast.error("Failed to update job status"); }
  };

  const requestFeedback = async (appId) => {
    const email = window.prompt("Enter the Hiring Manager's email address:");
    if (!email) return;
    const toastId = toast.loading('Sending magic link...');
    try {
      await axios.post(`/api/applications/${appId}/request-feedback?email=${encodeURIComponent(email)}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Email sent!', { id: toastId });
      viewApplicants(selectedJob);
    } catch (err) { toast.error('Failed to send email.', { id: toastId }); }
  };

  const updateCandidateStatus = async (appId, newStatus) => {
    try {
      await axios.patch(`/api/applications/${appId}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success(`Candidate marked as ${newStatus}`);
      viewApplicants(selectedJob);
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  // NEW: SECURE AXIOS DOWNLOAD FUNCTION
  const downloadResume = async (appId, seekerName) => {
    const toastId = toast.loading('Downloading resume...');
    try {
      const response = await axios.get(`/api/applications/download/${appId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: 'blob', // Important: Tells Axios we are expecting a binary file, not JSON
      });

      // Create a temporary hidden link to trigger the browser's download mechanic
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      // Sanitize name for the downloaded file
      const safeName = seekerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.setAttribute('download', `${safeName}_resume.pdf`);
      document.body.appendChild(link);
      link.click();

      // Clean up memory after download
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Download complete!', { id: toastId });
    } catch (err) {
      toast.error('Failed to download resume. Access Denied.', { id: toastId });
    }
  };

  const getScoreColor = (score) => {
    if (!score) return 'bg-secondary';
    if (score >= 80) return 'bg-success';
    if (score >= 50) return 'bg-warning text-dark';
    return 'bg-danger';
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4 text-white">My IT Listings</h2>
      <div className="row">

        <div className="col-md-5">
          {jobs.length === 0 ? <p>You haven't posted any jobs yet.</p> : jobs.map(job => (
            <div className={`card shadow-sm mb-3 hover-card ${selectedJob === job.id ? 'border-primary' : 'border-secondary border-opacity-25'}`} key={job.id} style={{cursor: 'pointer'}} onClick={() => viewApplicants(job.id)}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold text-primary mb-0">{job.title}</h5>
                  <span className={`badge ${job.status === 'ACTIVE' ? 'bg-success' : job.status === 'PAUSED' ? 'bg-warning text-dark' : 'bg-danger'}`}>{job.status}</span>
                </div>

                <div className="d-flex gap-2 border-top border-secondary border-opacity-25 pt-3 mt-3">
                  <button className="btn btn-sm btn-outline-success fw-bold" onClick={(e) => { e.stopPropagation(); updateJobStatus(job.id, 'ACTIVE'); }} disabled={job.status==='ACTIVE'}>Active</button>
                  <button className="btn btn-sm btn-outline-warning fw-bold" onClick={(e) => { e.stopPropagation(); updateJobStatus(job.id, 'PAUSED'); }} disabled={job.status==='PAUSED'}>Pause</button>
                  <button className="btn btn-sm btn-outline-danger fw-bold" onClick={(e) => { e.stopPropagation(); updateJobStatus(job.id, 'CLOSED'); }} disabled={job.status==='CLOSED'}>Close</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-md-7">
          {selectedJob ? (
            <div className="card shadow-sm border-0 p-4 bg-body-tertiary rounded-4">
              <h4 className="fw-bold mb-4 text-white">Candidates ({applicants.length})</h4>

              {applicants.length === 0 ? <p className="text-muted">No one has applied yet.</p> : (
                <ul className="list-group">
                  {applicants.map(app => (
                    <li className="list-group-item bg-body p-4 mb-4 rounded-4 border-0 shadow-sm" key={app.id}>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <strong className="fs-5 text-white">{app.seekerName}</strong> <br/>
                          <small className="text-muted">{app.seekerEmail}</small>
                        </div>
                        <div className={`badge ${getScoreColor(app.aiScore)} rounded-circle d-flex align-items-center justify-content-center shadow-lg border border-2 border-dark`} style={{width: '55px', height: '55px', fontSize: '1.2rem'}}>
                          {app.aiScore || 0}
                        </div>
                      </div>

                      <div className="p-3 mb-3 rounded-3" style={{backgroundColor: 'rgba(241, 196, 15, 0.05)', borderLeft: '4px solid #F1C40F'}}>
                        <small className="fw-bold text-warning text-uppercase d-block mb-1" style={{fontSize: '0.7rem'}}>✨ Gemini AI Analysis</small>
                        <p className="mb-0 text-muted small">{app.aiSummary || 'AI analysis pending or unavailable.'}</p>
                      </div>

                      <div className="d-flex align-items-center justify-content-between bg-dark p-3 rounded-3 mb-3 border border-secondary border-opacity-25">
                        <span className="fw-bold text-muted small text-uppercase">Tracking Stage:</span>
                        <select
                          className={`form-select form-select-sm w-auto fw-bold ${app.status === 'REJECTED' ? 'text-danger' : app.status === 'HIRED' ? 'text-success' : 'text-primary'}`}
                          value={app.status}
                          onChange={(e) => updateCandidateStatus(app.id, e.target.value)}
                          style={{backgroundColor: 'rgba(0,0,0,0.5)', border: 'none'}}
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="SHORTLISTED">Shortlisted</option>
                          <option value="HIRED">Hired</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>

                      {app.managerRating ? (
                        <div className="p-3 mb-3 rounded-3" style={{backgroundColor: 'rgba(46, 204, 113, 0.1)', borderLeft: '4px solid #2ecc71'}}>
                          <small className="fw-bold text-success text-uppercase d-block mb-1">Human Manager Feedback ({app.managerRating}/5 Stars)</small>
                          <p className="mb-0 text-muted small fst-italic">"{app.managerFeedback}"</p>
                        </div>
                      ) : (
                        <div className="mb-3 text-end">
                          <button className="btn btn-sm btn-outline-warning rounded-pill px-3 fw-bold" onClick={() => requestFeedback(app.id)} disabled={app.feedbackToken}>
                            {app.feedbackToken ? '✉️ Email Sent' : '✉️ Request Manager Feedback'}
                          </button>
                        </div>
                      )}

                      <div className="d-flex gap-3 pt-3 border-top border-secondary border-opacity-25 justify-content-between align-items-center mt-3">
                        {/* CHANGED: Now uses secure button instead of a tag */}
                        <button onClick={() => downloadResume(app.id, app.seekerName)} className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-bold">
                          📄 Download PDF
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : <div className="text-center text-muted mt-5"><p>Select a job to view candidates.</p></div>}
        </div>
      </div>
    </div>
  );
};
export default MyJobs;