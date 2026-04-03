import { ShieldCheck, Sparkles } from 'lucide-react'

function AuthSplitLayout({
  eyebrow,
  title,
  subtitle,
  sideBadge,
  sideTitle,
  sideDescription,
  highlights,
  footer,
  children,
}) {
  return (
    <main className='auth-v2-shell'>
      <div className='auth-v2-grid'>
        <aside className='auth-v2-brand fade-up'>
          <div className='auth-v2-brand-top'>
            <p className='auth-v2-badge'>
              <ShieldCheck size={14} strokeWidth={2.5} />
              {sideBadge}
            </p>
            <h1 className='auth-v2-brand-title'>{sideTitle}</h1>
            <p className='auth-v2-brand-copy'>{sideDescription}</p>
          </div>

          <div className='auth-v2-highlight-grid'>
            {(highlights || []).map((item) => {
              const Icon = item.icon || Sparkles
              return (
                <article key={item.title} className='auth-v2-highlight'>
                  <div className='auth-v2-highlight-icon'>
                    <Icon size={16} strokeWidth={2.3} />
                  </div>
                  <div>
                    <p className='auth-v2-highlight-title'>{item.title}</p>
                    <p className='auth-v2-highlight-copy'>{item.copy}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </aside>

        <section className='auth-v2-card fade-up fade-up-delay-1'>
          <p className='auth-v2-eyebrow'>{eyebrow}</p>
          <h2 className='auth-v2-title'>{title}</h2>
          <p className='auth-v2-subtitle'>{subtitle}</p>

          <div className='mt-6'>{children}</div>
          {footer ? <div className='auth-v2-footer'>{footer}</div> : null}
        </section>
      </div>
    </main>
  )
}

export default AuthSplitLayout
