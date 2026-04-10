import { Building2, Mail, Phone, Globe, Hash, User, Bed, Users } from 'lucide-react'

const BUSINESS_TYPES = ['Hotel', 'Resort', 'Lodge', 'Guesthouse']

function getValue(draft, path) {
    return path
        .split('.')
        .reduce((value, segment) => (value && typeof value === 'object' ? value[segment] : undefined), draft)
}

function Field({ label, required, hint, value, onChange, type = 'text', placeholder, icon: Icon }) {
    return (
        <div className='ca-field'>
            <label className='ca-field-label'>
                {Icon ? <Icon size={13} strokeWidth={2.5} style={{ color: '#5868d8' }} /> : null}
                {label}
                {required ? <span className='ca-field-label-required'>*</span> : null}
            </label>
            {hint ? <span className='ca-field-hint'>{hint}</span> : null}
            <input
                type={type}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className='ca-input'
            />
        </div>
    )
}

function Select({ label, required, value, onChange, options, icon: Icon }) {
    return (
        <div className='ca-field'>
            <label className='ca-field-label'>
                {Icon ? <Icon size={13} strokeWidth={2.5} style={{ color: '#5868d8' }} /> : null}
                {label}
                {required ? <span className='ca-field-label-required'>*</span> : null}
            </label>
            <select
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                className='ca-select'
            >
                <option value='' disabled>Select type…</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    )
}

function SectionCard({ icon: Icon, title, description, badge, children }) {
    return (
        <div className='ca-section-card ca-animate-up'>
            <div className='ca-section-header'>
                <div className='ca-section-icon'>
                    <Icon size={18} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                    <p className='ca-section-title'>{title}</p>
                    <p className='ca-section-desc'>{description}</p>
                </div>
                {badge ? (
                    <span
                        style={{
                            background: 'rgba(88,104,216,0.09)',
                            border: '1px solid rgba(88,104,216,0.2)',
                            color: '#4a52c9',
                            borderRadius: '999px',
                            padding: '0.2rem 0.65rem',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.09em',
                        }}
                    >
                        {badge}
                    </span>
                ) : null}
            </div>
            <div className='ca-section-body'>
                {children}
            </div>
        </div>
    )
}

function HotelApplicationForm({ draft, onChange }) {
    const businessName       = getValue(draft, 'businessInfo.name')
    const registrationNumber = getValue(draft, 'businessInfo.registrationNumber')
    const licenseNumber      = getValue(draft, 'businessInfo.licenseNumber')
    const businessType       = getValue(draft, 'businessInfo.businessType')
    const yearEstablished    = getValue(draft, 'businessInfo.yearEstablished')

    const ownerName = getValue(draft, 'businessInfo.contact.ownerName')
    const phone     = getValue(draft, 'businessInfo.contact.phone')
    const email     = getValue(draft, 'businessInfo.contact.email')
    const website   = getValue(draft, 'businessInfo.contact.website')
    const address   = getValue(draft, 'businessInfo.contact.address')

    const rooms       = getValue(draft, 'guestServices.facilities.numberOfRooms')
    const maxCapacity = getValue(draft, 'guestServices.facilities.maxCapacity')

    return (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
            {/* Business information */}
            <SectionCard
                icon={Building2}
                title='Business information'
                description='Provide the hotel identity details exactly as registered with authorities.'
                badge='Required'
            >
                <div style={{ display: 'grid', gap: '1.1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                    <Field
                        label='Hotel name'
                        required
                        icon={Building2}
                        value={businessName}
                        onChange={(v) => onChange('businessInfo.name', v)}
                        placeholder='e.g., AYANA Resort Bali'
                    />
                    <Select
                        label='Business type'
                        required
                        icon={Hash}
                        value={businessType}
                        onChange={(v) => onChange('businessInfo.businessType', v)}
                        options={BUSINESS_TYPES}
                    />
                    <Field
                        label='Registration number'
                        required
                        icon={Hash}
                        value={registrationNumber}
                        onChange={(v) => onChange('businessInfo.registrationNumber', v)}
                        placeholder='e.g., REG-12345'
                    />
                    <Field
                        label='License number'
                        required
                        icon={Hash}
                        value={licenseNumber}
                        onChange={(v) => onChange('businessInfo.licenseNumber', v)}
                        placeholder='e.g., LIC-67890'
                    />
                    <Field
                        label='Year established'
                        type='number'
                        icon={Hash}
                        value={yearEstablished}
                        onChange={(v) => onChange('businessInfo.yearEstablished', v ? Number(v) : '')}
                        placeholder='e.g., 1996'
                    />
                </div>
            </SectionCard>

            {/* Owner contact */}
            <SectionCard
                icon={User}
                title='Owner & contact'
                description='Used for follow-ups and verification communications during the review process.'
            >
                <div style={{ display: 'grid', gap: '1.1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                    <Field
                        label='Owner name'
                        required
                        icon={User}
                        value={ownerName}
                        onChange={(v) => onChange('businessInfo.contact.ownerName', v)}
                        placeholder='e.g., John Smith'
                    />
                    <Field
                        label='Phone number'
                        required
                        icon={Phone}
                        value={phone}
                        onChange={(v) => onChange('businessInfo.contact.phone', v)}
                        placeholder='e.g., +1 234 567 890'
                    />
                    <Field
                        label='Email address'
                        required
                        type='email'
                        icon={Mail}
                        value={email}
                        onChange={(v) => onChange('businessInfo.contact.email', v)}
                        placeholder='e.g., hotel@example.com'
                    />
                    <Field
                        label='Website'
                        icon={Globe}
                        value={website}
                        onChange={(v) => onChange('businessInfo.contact.website', v)}
                        placeholder='https://example.com'
                    />
                    <div style={{ gridColumn: '1 / -1' }}>
                        <Field
                            label='Full registered address'
                            required
                            icon={Building2}
                            value={address}
                            onChange={(v) => onChange('businessInfo.contact.address', v)}
                            placeholder='Street, City, Country'
                        />
                    </div>
                </div>
            </SectionCard>

            {/* Guest facilities */}
            <SectionCard
                icon={Bed}
                title='Guest facilities'
                description='Basic capacity information is required to accurately calculate your certification score.'
            >
                <div style={{ display: 'grid', gap: '1.1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                    <Field
                        label='Number of rooms'
                        required
                        type='number'
                        icon={Bed}
                        value={rooms}
                        onChange={(v) => onChange('guestServices.facilities.numberOfRooms', v ? Number(v) : '')}
                        placeholder='e.g., 120'
                    />
                    <Field
                        label='Maximum capacity'
                        type='number'
                        icon={Users}
                        value={maxCapacity}
                        onChange={(v) => onChange('guestServices.facilities.maxCapacity', v ? Number(v) : '')}
                        placeholder='e.g., 300'
                    />
                </div>
            </SectionCard>
        </div>
    )
}

export default HotelApplicationForm
