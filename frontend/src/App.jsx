import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Login from './pages/Login';
import Register from './pages/Register';
import PostJob from './pages/PostJob';
import JobDetails from './pages/JobDetails';
import MyJobs from './pages/MyJobs';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';
import FeedbackForm from './pages/FeedbackForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/post-job" element={<PostJob />} />
            {/* PUBLIC MAGIC LINK ROUTE */}
            <Route path="/feedback/:token" element={<FeedbackForm />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
export default App;