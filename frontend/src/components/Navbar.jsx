import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg nav-custom sticky-top py-3">
      <div className="container-fluid px-4">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="text-white">JOB</span><span className="text-primary">FINDER</span>
        </Link>

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item mx-2"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item mx-2">
              <Link className="nav-link" to="/jobs">
                <i className="bi bi-search me-1"></i> Discover Jobs
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto align-items-center">
            {!user ? (
              <>
                <li className="nav-item"><Link className="nav-link px-3" to="/login">Login</Link></li>
                <li className="nav-item ms-2"><Link className="btn btn-outline-primary btn-sm px-4 py-2" to="/register">Sign Up</Link></li>
              </>
            ) : (
              <li className="nav-item dropdown ms-2">
                <a className="nav-link p-0 d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                  <div className="d-flex align-items-center">
                    <img src={`https://ui-avatars.com/api/?name=${user.name || 'User'}&background=3B82F6&color=fff&bold=true`}
                      className="rounded-circle border border-2 border-primary" width="38" height="38" alt="Profile" />
                    <div className="ms-2 d-none d-sm-block text-start">
                      <span className="fw-bold d-block text-white" style={{fontSize: '0.9rem'}}>{user.name}</span>
                    </div>
                  </div>
                </a>

                <ul className="dropdown-menu dropdown-menu-end shadow-lg rounded-3 mt-3 py-2" style={{ minWidth: '220px' }}>
                  <li>
                    <Link className="dropdown-item py-2" to="/profile">
                      <i className="bi bi-person me-2 fs-5 align-middle"></i> My Profile
                    </Link>
                  </li>

                  {user.role === 'SEEKER' && (
                    <li>
                      <Link className="dropdown-item py-2" to="/my-applications">
                        <i className="bi bi-file-earmark-text me-2 fs-5 align-middle"></i> My Applications
                      </Link>
                    </li>
                  )}

                  {user.role === 'EMPLOYER' && (
                    <>
                      <li>
                        <Link className="dropdown-item py-2" to="/my-jobs">
                          <i className="bi bi-building me-2 fs-5 align-middle"></i> My Listings
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2 text-primary" to="/post-job">
                          <i className="bi bi-plus-circle me-2 fs-5 align-middle"></i> Post a New Job
                        </Link>
                      </li>
                    </>
                  )}

                  <li><hr className="dropdown-divider border-secondary opacity-25 my-2" /></li>
                  <li>
                    <button className="dropdown-item py-2 fw-bold text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2 fs-5 align-middle"></i> Log Out
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;