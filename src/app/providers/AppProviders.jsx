import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from '../store'
import { useAppDispatch } from '../store/hooks'
import { bootstrapAuthSession } from '../../features/auth/store/authSlice'

function AuthSessionBootstrap({ children }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(bootstrapAuthSession())
  }, [dispatch])

  return children
}

function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthSessionBootstrap>{children}</AuthSessionBootstrap>
      </BrowserRouter>
    </Provider>
  )
}

export default AppProviders
