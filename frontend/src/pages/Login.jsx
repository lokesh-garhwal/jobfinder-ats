import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Signing in...');
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', formData);
      // Pass the name from the backend to the login function
      login(response.data.token, response.data.role, response.data.name);
      toast.success(`Welcome back, ${response.data.name}!`, { id: toastId });
      navigate('/');
    } catch (err) {
      toast.error('Invalid credentials. Please try again.', { id: toastId });
    }
  };

  return (
    <div className="row justify-content-center py-5">
      <div className="col-md-5">
        <div className="card shadow-sm border-0 bg-body-tertiary" style={{ borderRadius: '1rem' }}>
          <div className="card-body p-5">
            <h3 className="text-center fw-bold mb-4">Welcome Back</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-bold">Username or Email</label>
                <input type="text" className="form-control" required placeholder="Enter username or email"
                  onChange={(e) => setFormData({...formData, identifier: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold">Password</label>
                <input type="password" className="form-control" required placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold mt-2">Sign In</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;