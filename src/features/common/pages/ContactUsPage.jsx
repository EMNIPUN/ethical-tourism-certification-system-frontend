function ContactUsPage() {
  return (
    <section className='info-page'>
      <div className='info-page__shell'>
        <p className='info-page__eyebrow'>Contact Us</p>
        <h1 className='info-page__title'>We are here to help</h1>
        <p className='info-page__lead'>
          Reach out for platform support, partnership opportunities, audit guidance, or account-related help.
        </p>

        <div className='info-page__grid'>
          <article className='info-card'>
            <h2>Support Email</h2>
            <p>
              <a href='mailto:support@ethicaltourism.org'>support@ethicaltourism.org</a>
            </p>
          </article>

          <article className='info-card'>
            <h2>Phone</h2>
            <p>
              <a href='tel:+94112345678'>+94 11 234 5678</a>
            </p>
          </article>

          <article className='info-card'>
            <h2>Working Hours</h2>
            <p>Monday to Friday, 9:00 AM to 6:00 PM (Sri Lanka Time)</p>
          </article>
        </div>
      </div>
    </section>
  )
}

export default ContactUsPage
