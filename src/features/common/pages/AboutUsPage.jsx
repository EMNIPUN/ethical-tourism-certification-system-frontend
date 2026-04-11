function AboutUsPage() {
  return (
    <section className='info-page'>
      <div className='info-page__shell'>
        <p className='info-page__eyebrow'>About Us</p>
        <h1 className='info-page__title'>Building trust in sustainable tourism</h1>
        <p className='info-page__lead'>
          Ethical Tourism Certification System helps travelers, auditors, and hotel owners make better,
          transparent decisions with verified sustainability standards.
        </p>

        <div className='info-page__grid'>
          <article className='info-card'>
            <h2>Our Mission</h2>
            <p>
              Promote responsible travel by providing a credible certification framework for hotels that
              prioritize environmental stewardship, ethical labor, and community impact.
            </p>
          </article>

          <article className='info-card'>
            <h2>What We Provide</h2>
            <p>
              A digital workflow for certification applications, expert audits, lifecycle tracking, and public
              search for certified properties.
            </p>
          </article>

          <article className='info-card'>
            <h2>Why It Matters</h2>
            <p>
              Travelers can choose confidently, hotels gain recognition for good practices, and local
              communities benefit from accountable tourism growth.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}

export default AboutUsPage
