import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { setSearchPage, setSearchQuery } from '../store/searchSlice'
import { selectSearchPage, selectSearchQuery } from '../store/searchSelectors'

function SearchExample() {
  const dispatch = useAppDispatch()
  const query = useAppSelector(selectSearchQuery)
  const page = useAppSelector(selectSearchPage)

  return (
    <section className='space-y-4'>
      <h1 className='text-2xl font-bold text-slate-900'>Search Feature</h1>
      <p className='text-sm text-slate-600'>
        Redux keeps this module state centralized for search, filters, and pagination.
      </p>

      <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
        <label className='block text-sm font-medium text-slate-700' htmlFor='searchQuery'>
          Search query
        </label>
        <input
          id='searchQuery'
          value={query}
          onChange={(event) => dispatch(setSearchQuery(event.target.value))}
          className='mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          placeholder='Search hotels, locations, keywords...'
        />

        <div className='mt-4 flex items-center gap-2'>
          <button
            type='button'
            onClick={() => dispatch(setSearchPage(Math.max(1, page - 1)))}
            className='rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100'
          >
            Previous
          </button>
          <span className='text-sm text-slate-700'>Page {page}</span>
          <button
            type='button'
            onClick={() => dispatch(setSearchPage(page + 1))}
            className='rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100'
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

export default SearchExample
