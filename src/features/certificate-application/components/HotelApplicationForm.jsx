const BUSINESS_TYPES = ['Hotel', 'Resort', 'Lodge', 'Guesthouse']

function getValue(draft, path) {
  return path
    .split('.')
    .reduce((value, segment) => (value && typeof value === 'object' ? value[segment] : undefined), draft)
}

function Field({ label, required, hint, value, onChange, type = 'text', placeholder }) {
  return (
    <label className='block text-sm font-semibold text-[var(--text-950)]'>
      <span className='inline-flex items-center gap-2'>
        {label}
        {required ? <span className='text-[var(--error-600)]'>*</span> : null}
      </span>
      {hint ? <span className='mt-1 block text-xs font-medium text-[var(--text-500)]'>{hint}</span> : null}
      <input
        type={type}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className='mt-2 h-12 w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 text-sm text-[var(--text-950)] outline-none transition focus:border-[var(--brand-700)] focus:ring-4 focus:ring-[var(--brand-700)]/15'
      />
    </label>
  )
}

function Select({ label, required, value, onChange, options }) {
  return (
    <label className='block text-sm font-semibold text-[var(--text-950)]'>
      <span className='inline-flex items-center gap-2'>
        {label}
        {required ? <span className='text-[var(--error-600)]'>*</span> : null}
      </span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className='mt-2 h-12 w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 text-sm text-[var(--text-950)] outline-none transition focus:border-[var(--brand-700)] focus:ring-4 focus:ring-[var(--brand-700)]/15'
      >
        <option value='' disabled>
          Select...
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function HotelApplicationForm({ draft, onChange }) {
  const businessName = getValue(draft, 'businessInfo.name')
  const registrationNumber = getValue(draft, 'businessInfo.registrationNumber')
  const licenseNumber = getValue(draft, 'businessInfo.licenseNumber')
  const businessType = getValue(draft, 'businessInfo.businessType')
  const yearEstablished = getValue(draft, 'businessInfo.yearEstablished')

  const ownerName = getValue(draft, 'businessInfo.contact.ownerName')
  const phone = getValue(draft, 'businessInfo.contact.phone')
  const email = getValue(draft, 'businessInfo.contact.email')
  const website = getValue(draft, 'businessInfo.contact.website')
  const address = getValue(draft, 'businessInfo.contact.address')

  const rooms = getValue(draft, 'guestServices.facilities.numberOfRooms')
  const maxCapacity = getValue(draft, 'guestServices.facilities.maxCapacity')

  return (
    <div className='grid gap-6'>
      <section className='rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-white)] p-6 shadow-[var(--shadow-soft)]'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h2 className='text-lg font-bold text-[var(--text-950)]'>Business information</h2>
            <p className='mt-1 text-sm font-medium text-[var(--text-700)]'>Provide the hotel identity details exactly as registered.</p>
          </div>
          <span className='badge-chip'>Step 1</span>
        </div>

        <div className='mt-6 grid gap-5 md:grid-cols-2'>
          <Field
            label='Hotel name'
            required
            value={businessName}
            onChange={(value) => onChange('businessInfo.name', value)}
            placeholder='e.g., AYANA Resort Bali'
          />
          <Select
            label='Business type'
            required
            value={businessType}
            onChange={(value) => onChange('businessInfo.businessType', value)}
            options={BUSINESS_TYPES}
          />
          <Field
            label='Registration number'
            required
            value={registrationNumber}
            onChange={(value) => onChange('businessInfo.registrationNumber', value)}
            placeholder='e.g., REG-12345'
          />
          <Field
            label='License number'
            required
            value={licenseNumber}
            onChange={(value) => onChange('businessInfo.licenseNumber', value)}
            placeholder='e.g., LIC-67890'
          />
          <Field
            label='Year established'
            type='number'
            value={yearEstablished}
            onChange={(value) => onChange('businessInfo.yearEstablished', value ? Number(value) : '')}
            placeholder='e.g., 1996'
          />
        </div>
      </section>

      <section className='rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-white)] p-6 shadow-[var(--shadow-soft)]'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h2 className='text-lg font-bold text-[var(--text-950)]'>Owner contact</h2>
            <p className='mt-1 text-sm font-medium text-[var(--text-700)]'>This is used for follow-ups during verification.</p>
          </div>
        </div>

        <div className='mt-6 grid gap-5 md:grid-cols-2'>
          <Field
            label='Owner name'
            required
            value={ownerName}
            onChange={(value) => onChange('businessInfo.contact.ownerName', value)}
          />
          <Field
            label='Phone'
            required
            value={phone}
            onChange={(value) => onChange('businessInfo.contact.phone', value)}
            placeholder='e.g., +1234567890'
          />
          <Field
            label='Email'
            required
            type='email'
            value={email}
            onChange={(value) => onChange('businessInfo.contact.email', value)}
            placeholder='e.g., hotel@example.com'
          />
          <Field
            label='Website'
            value={website}
            onChange={(value) => onChange('businessInfo.contact.website', value)}
            placeholder='https://...'
          />
          <div className='md:col-span-2'>
            <Field
              label='Address'
              required
              value={address}
              onChange={(value) => onChange('businessInfo.contact.address', value)}
              placeholder='Full registered address'
            />
          </div>
        </div>
      </section>

      <section className='rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-white)] p-6 shadow-[var(--shadow-soft)]'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h2 className='text-lg font-bold text-[var(--text-950)]'>Guest facilities</h2>
            <p className='mt-1 text-sm font-medium text-[var(--text-700)]'>Basic capacity information is required for scoring.</p>
          </div>
        </div>

        <div className='mt-6 grid gap-5 md:grid-cols-2'>
          <Field
            label='Number of rooms'
            required
            type='number'
            value={rooms}
            onChange={(value) => onChange('guestServices.facilities.numberOfRooms', value ? Number(value) : '')}
            placeholder='e.g., 200'
          />
          <Field
            label='Maximum capacity'
            type='number'
            value={maxCapacity}
            onChange={(value) => onChange('guestServices.facilities.maxCapacity', value ? Number(value) : '')}
            placeholder='e.g., 450'
          />
        </div>
      </section>
    </div>
  )
}

export default HotelApplicationForm
