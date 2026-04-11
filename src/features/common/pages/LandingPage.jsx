import { Link } from 'react-router-dom'
import { FEATURE_ROUTES } from '../../../app/router/featureRoutes'

const heroImageUrl =
  'https://cf.bstatic.com/xdata/images/hotel/max1024x768/443864191.jpg?k=0837457835c35fea09548980489550e0d70ede5cb8cef3af85e65551e4eecbe0&o='

const trustMetrics = [
  { label: 'Certified Hotels', value: '420+' },
  { label: 'Audits Completed', value: '1,900+' },
  { label: 'Traveler Searches', value: '78K+' },
]

const featureHighlights = [
  {
    title: 'Reliable Certification Workflow',
    description:
      'Manage end-to-end applications, document verification, and compliance milestones with role-based governance.',
  },
  {
    title: 'Evidence-Driven Audits',
    description:
      'Track findings, risk insights, and recommendations in one place so every decision stays transparent and measurable.',
  },
  {
    title: 'Public Trust Through Search',
    description:
      'Expose verified hotel sustainability profiles for travelers and partners to discover trusted ethical destinations quickly.',
  },
]

const spotlightNotes = [
  'ISO-aligned sustainability checkpoints',
  'Role-based reviews for applicant, auditor, and admin teams',
  'Public confidence through verified profile publishing',
]

const journeySteps = [
  {
    title: 'Apply With Structured Evidence',
    detail: 'Hotels submit sustainability records, compliance documents, and improvement plans in one guided flow.',
  },
  {
    title: 'Audit And Verify Transparently',
    detail: 'Auditors review submissions with traceable findings, recommendations, and risk scoring.',
  },
  {
    title: 'Publish Trust Signals Publicly',
    detail: 'Approved properties appear in searchable listings so travelers can compare verified ethical standards.',
  },
]

const outcomeCards = [
  {
    title: 'For Hotels',
    detail: 'Gain visible credibility, streamline renewals, and show measurable sustainability commitment.',
  },
  {
    title: 'For Auditors',
    detail: 'Reduce manual follow-up with digital workflows and consistent evidence tracking across audits.',
  },
  {
    title: 'For Travelers',
    detail: 'Choose accommodations confidently with transparent, verified sustainability information.',
  },
]

function LandingPage() {
  return (
    <section className='landing-page'>
      <div className='landing-page__shape landing-page__shape--one' aria-hidden='true' />
      <div className='landing-page__shape landing-page__shape--two' aria-hidden='true' />
      <div className='landing-page__shape landing-page__shape--three' aria-hidden='true' />

      <div className='landing-page__shell'>
        <header className='landing-hero'>
          <div className='landing-hero__main'>
            <p className='landing-hero__eyebrow'>Ethical Tourism Certification System</p>
            <h1 className='landing-hero__title'>
              Build trust in sustainable travel with a certification platform designed for impact.
            </h1>
            <p className='landing-hero__lead'>
              From hotel onboarding to audit decisions and public discovery, manage every step in a
              secure, transparent, and modern certification ecosystem.
            </p>

            <div className='landing-hero__actions'>
              <Link to={FEATURE_ROUTES.login} className='landing-btn landing-btn--primary'>
                Sign In
              </Link>
              <Link to={FEATURE_ROUTES.register} className='landing-btn landing-btn--secondary'>
                Create Account
              </Link>
            </div>

            <div className='landing-hero__links'>
              <Link to={FEATURE_ROUTES.about}>About</Link>
              <Link to={FEATURE_ROUTES.contact}>Contact</Link>
              <Link to={FEATURE_ROUTES.privacy}>Privacy</Link>
              <Link to={FEATURE_ROUTES.terms}>Terms</Link>
            </div>
          </div>

          <aside className='landing-hero__aside' aria-label='Program highlights'>
            <p className='landing-hero__aside-title'>Program Snapshot</p>
            <ul className='landing-hero__aside-list'>
              {spotlightNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            <div className='landing-hero__image-wrap'>
              <img src={heroImageUrl} alt='Sustainable travel destination' className='landing-hero__image' />
            </div>
            <div className='landing-hero__badge' aria-hidden='true'>
              Trusted by auditors and eco-conscious travelers
            </div>
          </aside>
        </header>

        <section className='landing-ribbon' aria-label='Sustainability pillars'>
          <p>Environmental Stewardship</p>
          <p>Ethical Labor</p>
          <p>Local Community Impact</p>
          <p>Transparent Governance</p>
        </section>

        <section className='landing-grid'>
          <section className='landing-metrics' aria-label='Platform trust metrics'>
            {trustMetrics.map((metric) => (
              <article key={metric.label} className='landing-metric-card'>
                <p className='landing-metric-card__value'>{metric.value}</p>
                <p className='landing-metric-card__label'>{metric.label}</p>
              </article>
            ))}
          </section>

          <section className='landing-features' aria-label='Core platform features'>
            {featureHighlights.map((feature) => (
              <article key={feature.title} className='landing-feature-card'>
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
              </article>
            ))}
          </section>
        </section>

        <section className='landing-journey' aria-label='How the certification journey works'>
          <p className='landing-journey__eyebrow'>How It Works</p>
          <h2 className='landing-journey__title'>A clear path from application to public trust</h2>
          <div className='landing-journey__grid'>
            {journeySteps.map((step, index) => (
              <article key={step.title} className='landing-journey-card'>
                <p className='landing-journey-card__index'>Step {index + 1}</p>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className='landing-outcomes' aria-label='Platform outcomes'>
          {outcomeCards.map((item) => (
            <article key={item.title} className='landing-outcome-card'>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>

        <section className='landing-cta-strip' aria-label='Get started'>
          <p>Ready to move from compliance checklists to measurable sustainability leadership?</p>
          <Link to={FEATURE_ROUTES.register} className='landing-btn landing-btn--primary'>
            Start Certification Journey
          </Link>
        </section>

        <div className='landing-ornaments' aria-hidden='true'>
          <span className='landing-orb landing-orb--one' />
          <span className='landing-orb landing-orb--two' />
          <span className='landing-orb landing-orb--three' />
          <span className='landing-orb landing-orb--four' />
          <div className='landing-wave' />
          <div className='landing-wave landing-wave--delayed' />
        </div>
      </div>
    </section>
  )
}

export default LandingPage
