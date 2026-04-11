function TermsAndConditionsPage() {
  return (
    <section className='info-page'>
      <div className='info-page__shell'>
        <p className='info-page__eyebrow'>Terms & Conditions</p>
        <h1 className='info-page__title'>Platform usage terms</h1>
        <p className='info-page__lead'>
          By using this platform, users agree to provide accurate data and use certification features in good
          faith.
        </p>

        <div className='info-page__stack'>
          <article className='info-card'>
            <h2>User Responsibilities</h2>
            <p>Users must submit truthful information and maintain secure account credentials.</p>
          </article>

          <article className='info-card'>
            <h2>Certification Integrity</h2>
            <p>
              Any misuse, fraudulent submissions, or attempts to manipulate audit outcomes may result in
              suspension.
            </p>
          </article>

          <article className='info-card'>
            <h2>Service Availability</h2>
            <p>We may improve or maintain the platform periodically while minimizing service disruption.</p>
          </article>
        </div>
      </div>
    </section>
  )
}

export default TermsAndConditionsPage
