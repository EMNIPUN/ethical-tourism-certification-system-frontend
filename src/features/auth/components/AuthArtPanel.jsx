function AuthArtPanel() {
  return (
    <aside className='relative hidden h-full overflow-hidden bg-[#211f8f] md:block'>
      <div className='grid h-full w-full grid-cols-4 grid-rows-4'>
        <div className='relative bg-gradient-to-br from-[#8b58ff] via-[#6d32df] to-[#6c44e0]'>
          <div className='absolute inset-x-0 top-0 h-full rounded-b-full border border-white/25 bg-white/10' />
        </div>
        <div className='relative bg-gradient-to-br from-[#9e7dff] via-[#6e3de8] to-[#5d37d4]'>
          <div className='absolute left-1/2 top-0 h-full w-full -translate-x-1/2 rounded-b-full border border-white/20 bg-white/10' />
        </div>
        <div className='relative bg-[#09165c]'>
          <div className='absolute left-4 top-4 h-5 w-5 rotate-45 bg-[#ff8f3d]' />
          <div className='absolute left-9 top-4 h-5 w-5 rotate-45 bg-[#ffd33f]' />
          <div className='absolute left-14 top-4 h-5 w-5 rotate-45 bg-[#f93d76]' />
          <div className='absolute left-4 top-12 h-1 w-24 bg-[#37d7ff]' />
          <div className='absolute left-4 top-16 h-4 w-24 border-y-2 border-[#9cdfff]' />
          <div className='absolute left-4 top-24 h-2 w-20 bg-[#4651d4]' />
        </div>
        <div className='relative bg-gradient-to-br from-[#5f67cf] via-[#4149b6] to-[#2a328f]'>
          <div className='absolute inset-0 opacity-35 [background:repeating-linear-gradient(135deg,transparent,transparent_7px,rgba(255,255,255,0.18)_7px,rgba(255,255,255,0.18)_10px)]' />
        </div>

        <div className='relative bg-[#2d2ea3]'>
          <div className='absolute left-8 top-8 h-0 w-0 border-b-[26px] border-l-[22px] border-r-[22px] border-b-[#7aa2ff] border-l-transparent border-r-transparent' />
          <div className='absolute left-8 top-20 h-0 w-0 border-b-[26px] border-l-[22px] border-r-[22px] border-b-[#5f82ff] border-l-transparent border-r-transparent' />
        </div>
        <div className='relative bg-[#2d2ea3]'>
          <div className='absolute left-1/2 top-8 h-16 w-16 -translate-x-1/2 rounded-full bg-[#5d78ff]/70' />
          <div className='absolute left-1/2 top-14 h-16 w-16 -translate-x-1/2 rounded-full bg-[#2f39b6]/85' />
        </div>
        <div className='relative bg-[#2d2ea3]'>
          <div className='absolute left-8 top-10 grid grid-cols-2 gap-1'>
            <span className='h-3 w-3 bg-[#5e6ef8]' />
            <span className='h-3 w-3 bg-[#7284ff]' />
            <span className='h-3 w-3 bg-[#6d7cff]' />
            <span className='h-3 w-3 bg-[#4e5adc]' />
          </div>
        </div>
        <div className='relative bg-[#4d54d2]'>
          <div className='absolute -left-8 top-4 h-24 w-40 rounded-full border border-white/20 bg-[#6c72ea]' />
        </div>

        <div className='relative bg-[#1f2297]'>
          <div className='absolute inset-x-0 top-6 h-[2px] bg-[#6f86ff]' />
          <div className='absolute inset-x-0 top-9 h-[2px] bg-[#6f86ff]/70' />
          <div className='absolute inset-x-0 top-12 h-[2px] bg-[#6f86ff]/55' />
        </div>
        <div className='relative bg-[#1f2297]'>
          <div className='absolute left-4 top-6 h-0 w-0 border-b-[18px] border-l-[26px] border-r-[26px] border-b-[#ffd100] border-l-transparent border-r-transparent' />
          <div className='absolute left-[28px] top-0 h-0 w-0 border-b-[20px] border-l-[8px] border-r-[8px] border-b-[#ffd100] border-l-transparent border-r-transparent' />
        </div>
        <div className='relative bg-[#4c3fe0]'>
          <div className='absolute left-8 top-10 flex gap-2'>
            <span className='h-3 w-3 rounded-full bg-[#7e82ff]/75' />
            <span className='h-3 w-3 rounded-full bg-[#7e82ff]/50' />
            <span className='h-3 w-3 rounded-full bg-[#7e82ff]/35' />
            <span className='h-3 w-3 rounded-full bg-[#7e82ff]/20' />
          </div>
        </div>
        <div className='relative bg-[#4b44d4]'>
          <div className='absolute bottom-8 left-8 h-10 w-20 border-b border-l border-r border-[#b3a4ff]' />
          <div className='absolute bottom-8 left-8 h-10 w-20 [background:conic-gradient(from_180deg,#cabdff,transparent)] opacity-80' />
        </div>

        <div className='relative bg-[#2f35a8]'>
          <div className='absolute bottom-0 left-0 h-20 w-40 rounded-tr-[80px] border border-[#5d77ff] bg-[#1f2b99]' />
        </div>
        <div className='relative bg-[#2f35a8]'>
          <div className='absolute bottom-0 left-0 h-full w-8 bg-[#4f5ad8]' />
        </div>
        <div className='relative bg-[#09155f]'>
          <div className='absolute -left-10 -top-10 h-52 w-52 rounded-full border border-[#4a5dd2] bg-[#08114f]' />
        </div>
        <div className='relative bg-[#2143aa]'>
          <div className='absolute left-0 top-7 h-28 w-40 rounded-r-[70px] border border-[#5068da] bg-[#172f8f]' />
        </div>
      </div>

      <div className='pointer-events-none absolute inset-0 border-l border-white/25' />
    </aside>
  )
}

export default AuthArtPanel
