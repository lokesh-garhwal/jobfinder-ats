import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedMode, setSelectedMode] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8080/api/jobs').then(res => setJobs(res.data));
  }, []);

  // Dynamic Industries
  const uniqueIndustries = [...new Set(jobs.map(job => job.industry).filter(Boolean))].sort();

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry ? job.industry === selectedIndustry : true;
    const matchesMode = selectedMode ? job.jobMode === selectedMode : true;

    return matchesSearch && matchesIndustry && matchesMode;
  });

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Explore Opportunities</h2>
        <span className="badge bg-primary rounded-pill fs-6 px-3">{filteredJobs.length} Jobs Found</span>
      </div>

      <div className="card shadow-sm border-0 bg-body-tertiary rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-bold text-muted small text-uppercase">Keyword / Company</label>
              <input type="text" className="form-control" placeholder="Search titles..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold text-muted small text-uppercase">Industry</label>
              <select className="form-select" value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)}>
                <option value="">All Industries</option>
                {uniqueIndustries.map((ind, idx) => (
                  <option key={idx} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold text-muted small text-uppercase">Work Mode</label>
              <select className="form-select" value={selectedMode} onChange={(e) => setSelectedMode(e.target.value)}>
                <option value="">Any Mode</option>
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="text-end mt-3">
            <button className="btn btn-sm btn-outline-secondary rounded-pill px-4"
              onClick={() => { setSearchTerm(''); setSelectedIndustry(''); setSelectedMode(''); }}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center mt-5">
            <h4 className="text-muted fw-bold">No jobs match your exact criteria.</h4>
            <p>Try clearing some filters to see more results.</p>
          </div>
        ) : filteredJobs.map(job => (
          <div className={`col-md-6 ${job.status === 'PAUSED' ? 'opacity-75' : ''}`} key={job.id}>
            <div className="card hover-card h-100 shadow-sm p-3 border-0 bg-body-tertiary" style={{ borderRadius: '1rem' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h4 className="fw-bold mb-1 text-primary">{job.title}</h4>
                    <span className="text-muted fw-bold d-block mb-3">🏢 {job.organizationName}</span>
                  </div>
                  <div className="text-end">
                    <span className="badge badge-custom d-block mb-2">{job.jobMode}</span>
                    {job.status === 'ACTIVE' && <span className="badge bg-success shadow-sm">✅ Active</span>}
                    {job.status === 'PAUSED' && <span className="badge bg-warning text-dark shadow-sm">⏸️ Paused</span>}
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3 border-top pt-3">
                  <span className="text-muted fw-medium">📍 {job.location}</span>
                  <span className="text-success fw-bold">💰 {job.salary}</span>
                </div>

                <button onClick={() => navigate(`/job/${job.id}`)} className={`btn w-100 rounded-pill fw-bold ${job.status === 'PAUSED' ? 'btn-secondary' : 'btn-outline-primary'}`}>
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Jobs;