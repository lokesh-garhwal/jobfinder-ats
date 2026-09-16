import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const FeedbackForm = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/applications/feedback/${token}`)
      .then(res => setData(res.data))
      .catch(() => toast.error("Invalid or expired magic link."));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Submitting...');
    try {
      await axios.post(`http://localhost:8080/api/applications/feedback/${token}`, { rating, feedback });
      toast.success('Feedback recorded!', { id: toastId });
      setSubmitted(true);
    } catch (err) {
      toast.error('Submission failed.', { id: toastId });
    }
  };

  if (submitted) {
    return (
      <div className="container py-5 text-center">
        <h1 className="text-success fw-bold display-1 mb-4">✓</h1>
        <h2 className="text-white">Feedback Successfully Submitted</h2>
        <p className="text-muted">You may now close this tab.</p>
      </div>
    );
  }

  if (!data) return <div className="text-center mt-5 text-white">Loading Candidate Details...</div>;

  return (
    <div className="row justify-content-center py-4">
      <div className="col-md-7">
        <div className="card shadow-lg border-0 bg-body-tertiary rounded-4">
          <div className="card-body p-5">
            <div className="text-center mb-4 pb-3 border-bottom">
              <h2 className="fw-bold text-primary mb-1">Candidate Evaluation</h2>
              <p className="text-muted">For the role of <strong>{data.jobTitle}</strong></p>
            </div>

            <div className="bg-body p-4 rounded-3 mb-4 border">
              <h5 className="fw-bold text-white mb-3">Candidate: {data.candidateName}</h5>
              <div className="d-flex align-items-center mb-2">
                <span className="badge bg-primary fs-6 me-2">AI Score: {data.aiScore} / 100</span>
              </div>
              <p className="text-muted small mb-0 mt-3" style={{ borderLeft: '4px solid #F1C40F', paddingLeft: '1rem' }}>
                <strong>AI Summary:</strong> {data.aiSummary}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-bold">Overall Rating (1-5)</label>
                <select className="form-select form-select-lg" value={rating} onChange={e => setRating(e.target.value)}>
                  <option value="5">⭐⭐⭐⭐⭐ - Strong Hire</option>
                  <option value="4">⭐⭐⭐⭐ - Hire</option>
                  <option value="3">⭐⭐⭐ - Neutral / Needs Interview</option>
                  <option value="2">⭐⭐ - Weak Fit</option>
                  <option value="1">⭐ - Reject</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Manager Comments</label>
                <textarea className="form-control" rows="4" required placeholder="What are your thoughts on this candidate?"
                  value={feedback} onChange={e => setFeedback(e.target.value)}></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill fw-bold">
                Submit Official Feedback
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FeedbackForm;