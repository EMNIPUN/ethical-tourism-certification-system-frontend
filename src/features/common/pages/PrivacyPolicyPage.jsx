function PrivacyPolicyPage() {
  return (
    <section className='info-page'>
      <div className='info-page__shell'>
        <p className='info-page__eyebrow'>Privacy Policy</p>
        <h1 className='info-page__title'>Your data, handled responsibly</h1>
        <p className='info-page__lead'>
          We collect only the information necessary to provide authentication, certification workflows, and
          audit-related services.
        </p>

        <div className='info-page__stack'>
          <article className='info-card'>
            <h2>Information We Collect</h2>
            <p>Account details, submitted documents, and audit workflow activity relevant to certification.</p>
          </article>

          <article className='info-card'>
            <h2>How We Use Data</h2>
            <p>To operate the platform, verify processes, improve service quality, and protect platform security.</p>
          </article>

          <article className='info-card'>
            <h2>Your Rights</h2>
            <p>You can request corrections or support regarding your account data through our support team.</p>
          </article>
        </div>
      </div>
    </section>
  )
}

export default PrivacyPolicyPage
