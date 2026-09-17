import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({ fullName: '', email: '', phoneNumber: '', username: '', role: '' });
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    axios.get('/api/users/profile', { headers: { Authorization: `Bearer ${user.token}` } })
    .then(res => {
      setFormData({
        fullName: res.data.fullName || '', email: res.data.email || '',
        phoneNumber: res.data.phoneNumber || '', username: res.data.username || '', role: res.data.role || ''
      });
      setFetching(false);
    })
    .catch(() => { toast.error("Failed to load profile data."); setFetching(false); });
  }, [user]);

  // Handle General Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Updating profile...');
    setLoading(true);
    try {
      await axios.put('/api/users/profile', formData, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Profile updated successfully!', { id: toastId });
      if (formData.fullName !== user.name) {
          localStorage.setItem('name', formData.fullName);
          window.dispatchEvent(new Event("storage"));
      }
    } catch (error) { toast.error('Failed to update profile.', { id: toastId }); }
    finally { setLoading(false); }
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (passData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    const toastId = toast.loading('Updating password...');
    setPassLoading(true);
    try {
      await axios.put('/api/users/change-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      }, { headers: { Authorization: `Bearer ${user.token}` } });

      toast.success('Password changed successfully!', { id: toastId });
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear form
    } catch (error) {
      toast.error(error.response?.data || 'Failed to update password.', { id: toastId });
    } finally { setPassLoading(false); }
  };

  if (fetching) return <div className="text-center mt-5 fw-bold text-muted">Loading Profile...</div>;

  return (
    <div className="row justify-content-center py-4">
      <div className="col-md-8">

        {/* Profile Information Card */}
        <div className="card shadow-sm border-0 bg-body-tertiary mb-4" style={{ borderRadius: '1rem' }}>
          <div className="card-body p-5">
            <div className="text-center mb-5 border-bottom pb-4">
              <img src={`https://ui-avatars.com/api/?name=${formData.fullName || 'User'}&background=4f46e5&color=fff&bold=true&size=100`} className="rounded-circle shadow-sm border border-4 border-white mb-3" alt="Profile" />
              <h2 className="fw-bold text-primary mb-1">{formData.fullName}</h2>
              <span className="badge badge-custom fs-6">{formData.role === 'EMPLOYER' ? 'Recruiter / Employer' : 'Job Seeker'}</span>
            </div>

            <form onSubmit={handleProfileSubmit} className="row g-4">
              <div className="col-12"><h5 className="fw-bold text-muted mb-0">Personal Information</h5></div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Full Name</label>
                <input type="text" className="form-control" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Email Address</label>
                <input type="email" className="form-control" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Phone Number</label>
                <input type="text" className="form-control" placeholder="e.g. +1 234 567 8900" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted">Username <small>(Read-only)</small></label>
                <input type="text" className="form-control bg-secondary bg-opacity-10" value={formData.username} disabled />
              </div>
              <div className="col-12 mt-4 text-end">
                <button type="submit" className="btn btn-primary px-5 rounded-pill fw-bold" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security & Password Card */}
        <div className="card shadow-sm border-0 bg-body-tertiary" style={{ borderRadius: '1rem' }}>
          <div className="card-body p-5">
            <h5 className="fw-bold text-muted mb-4 border-bottom pb-3">🔒 Security & Password</h5>
            <form onSubmit={handlePasswordSubmit} className="row g-3">
              <div className="col-md-12">
                <label className="form-label fw-bold">Current Password</label>
                <input type="password" className="form-control" required placeholder="Enter your current password"
                  value={passData.currentPassword} onChange={e => setPassData({...passData, currentPassword: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">New Password</label>
                <input type="password" className="form-control" required placeholder="Min. 6 characters"
                  value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Confirm New Password</label>
                <input type="password" className="form-control" required placeholder="Repeat new password"
                  value={passData.confirmPassword} onChange={e => setPassData({...passData, confirmPassword: e.target.value})} />
              </div>
              <div className="col-12 mt-4 text-end">
                <button type="submit" className="btn btn-outline-primary px-5 rounded-pill fw-bold" disabled={passLoading}>
                  {passLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Profile;