import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
      fullName: '', email: '', username: '', phoneNumber: '', password: '', role: 'SEEKER'
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/auth/register', formData);
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage('Registration failed. Username or Email might already be taken.');
    }
  };

  return (
    <div className="row justify-content-center py-4">
      <div className="col-md-7">
        <div className="card shadow-sm border-0 bg-body-tertiary" style={{ borderRadius: '1rem' }}>
          <div className="card-body p-5">
            <h3 className="text-center fw-bold mb-4">Create Your Profile</h3>
            {message && <div className="alert alert-info rounded-pill text-center">{message}</div>}

            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-12">
                <label className="form-label fw-bold">Full Name</label>
                <input type="text" className="form-control" required placeholder="John Doe"
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Email Address</label>
                <input type="email" className="form-control" required placeholder="john@example.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Username</label>
                <input type="text" className="form-control" required placeholder="johndoe123"
                  onChange={(e) => setFormData({...formData, username: e.target.value})} />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Phone Number (Optional)</label>
                <input type="text" className="form-control" placeholder="+1 234 567 8900"
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Account Type</label>
                <select className="form-select" style={{ borderRadius: '0.75rem', padding: '0.75rem 1.2rem' }}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="SEEKER">Job Seeker</option>
                  <option value="EMPLOYER">Employer / Recruiter</option>
                </select>
              </div>

              <div className="col-md-12">
                <label className="form-label fw-bold">Password</label>
                <input type="password" className="form-control" required placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>

              <div className="col-12 mt-4">
                <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold">
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;