import { Link } from 'react-router-dom'
import { FEATURE_ROUTES } from '../../../app/router/featureRoutes'

function AppFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='site-footer'>
      <div className='site-footer__inner'>
        <div className='site-footer__top'>
          <div className='site-footer__column'>
            <p className='site-footer__brand'>Ethical Tourism Certification System</p>
            <p className='site-footer__description'>
              A trusted platform for transparent, sustainable, and responsible tourism certification.
            </p>
          </div>

          <div className='site-footer__column'>
            <p className='site-footer__heading'>Quick Links</p>
            <nav aria-label='Footer navigation'>
              <ul className='site-footer__links'>
                <li><Link to={FEATURE_ROUTES.login}>Login</Link></li>
                <li><Link to={FEATURE_ROUTES.register}>Register</Link></li>
                <li><Link to='/search'>Search Hotels</Link></li>
              </ul>
            </nav>
          </div>

          <div className='site-footer__column'>
            <p className='site-footer__heading'>Company</p>
            <ul className='site-footer__links'>
              <li><Link to={FEATURE_ROUTES.about}>About Us</Link></li>
              <li><Link to={FEATURE_ROUTES.contact}>Contact Us</Link></li>
              <li><Link to={FEATURE_ROUTES.privacy}>Privacy Policy</Link></li>
              <li><Link to={FEATURE_ROUTES.terms}>Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className='site-footer__bottom'>
          <p className='site-footer__meta'>© {currentYear} Ethical Tourism Certification System</p>
          <p className='site-footer__meta'>Built for user-friendly and ethical travel decisions.</p>
        </div>
      </div>
    </footer>
  )
}

export default AppFooter
