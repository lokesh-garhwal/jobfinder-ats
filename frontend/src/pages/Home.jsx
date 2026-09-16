import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container-fluid px-4 mt-2">
      <div className="hero-wrapper p-5" style={{
        position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.7) 100%), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '1rem', overflow: 'hidden', marginBottom: '3rem'
      }}>
        <div className="row w-100 align-items-center">
          <div className="col-lg-5 order-2 order-lg-1 mt-5 mt-lg-0 pe-lg-5 text-end border-end border-secondary border-opacity-25 d-none d-lg-block">
            <h3 className="fst-italic fw-light mb-4 text-white opacity-75" style={{ fontFamily: 'Georgia, serif' }}>
              Everybody wants to <br/> find their true calling
            </h3>
            {/* FIXED: Changed from text-muted to text-light opacity-75 for visibility */}
            <p className="text-light opacity-75 small lh-lg mb-0 text-end">
              Connect with top-tier organizations. We provide a seamless platform for professionals to discover opportunities and for companies to acquire exceptional talent.
            </p>
          </div>
          <div className="col-lg-7 order-1 order-lg-2 ps-lg-5">
            <h1 className="text-white mb-2 fw-bold" style={{fontSize: '4.5rem', lineHeight: '1.1'}}>
              BUILDING A <br/>
              <span className="text-primary">PROFESSIONAL CAREER</span>
            </h1>
            <p className="text-light opacity-75 mt-3 mb-5 fs-5">
              Discover opportunities that align with your expertise and ambitions.
            </p>
            <div className="d-flex align-items-center gap-4">
              <Link to="/jobs" className="btn btn-primary rounded-0 px-5 py-3">Discover More</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;