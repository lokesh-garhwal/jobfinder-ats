import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'SEEKER') { navigate('/'); return; }

    axios.get('http://localhost:8080/api/applications/my-applications', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => setApplications(res.data))
    .catch(() => toast.error("Failed to load applications."));
  }, [user, navigate]);

  const STAGES = ['APPLIED', 'IN_REVIEW', 'SHORTLISTED', 'HIRED'];

  const getTimelineColors = (currentStatus, stageIndex) => {
    if (currentStatus === 'REJECTED') {
      return stageIndex === 0 ? 'bg-danger text-white' : 'bg-secondary text-muted opacity-25';
    }
    const currentIndex = STAGES.indexOf(currentStatus);
    if (stageIndex <= currentIndex) return 'bg-primary text-dark fw-bold border border-primary';
    return 'bg-dark text-muted border border-secondary';
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4 hero-accent-text">My Applications</h2>

      {applications.length === 0 ? (
        <div className="card border-0 bg-body-tertiary p-5 text-center shadow-sm rounded-4">
          <h4 className="text-muted">You haven't applied to any jobs yet.</h4>
        </div>
      ) : (
        <div className="row g-4">
          {applications.map(app => (
            <div className="col-12" key={app.id}>
              <div className="card shadow-sm border-0 bg-body-tertiary rounded-4 p-4 hover-card">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="fw-bold text-white mb-1">{app.jobTitle}</h4>
                    <span className="text-muted small">📍 {app.jobLocation} • Applied on {new Date(app.appliedDate).toLocaleDateString()}</span>
                  </div>
                  {app.status === 'REJECTED' && (
                    <span className="badge bg-danger fs-6 px-3 py-2 rounded-pill">Status: Rejected</span>
                  )}
                  {app.status === 'HIRED' && (
                    <span className="badge bg-success fs-6 px-3 py-2 rounded-pill">Status: Hired! 🎉</span>
                  )}
                </div>

                {/* VISUAL TIMELINE TRACKER */}
                <div className="position-relative mt-4 mb-2">
                  <div className="progress position-absolute top-50 start-0 w-100 translate-middle-y" style={{ height: '4px', zIndex: 0, backgroundColor: '#334155' }}>
                    <div className={`progress-bar ${app.status === 'REJECTED' ? 'bg-danger' : 'bg-primary'}`} role="progressbar"
                         style={{ width: app.status === 'REJECTED' ? '10%' : `${(STAGES.indexOf(app.status) / (STAGES.length - 1)) * 100}%` }}></div>
                  </div>

                  <div className="d-flex justify-content-between position-relative z-1">
                    {STAGES.map((stage, idx) => (
                      <div key={idx} className="text-center d-flex flex-column align-items-center bg-body-tertiary px-2" style={{width: '80px'}}>
                        <div className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm mb-2 ${getTimelineColors(app.status, idx)}`}
                             style={{ width: '35px', height: '35px', fontSize: '0.9rem', transition: 'all 0.4s' }}>
                          {app.status === 'REJECTED' && idx === 0 ? '✕' : (idx <= STAGES.indexOf(app.status) && app.status !== 'REJECTED' ? '✓' : idx + 1)}
                        </div>
                        <small className={`fw-bold text-uppercase ${idx <= STAGES.indexOf(app.status) && app.status !== 'REJECTED' ? 'text-primary' : 'text-muted'}`} style={{fontSize: '0.65rem'}}>
                          {stage.replace('_', ' ')}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyApplications;