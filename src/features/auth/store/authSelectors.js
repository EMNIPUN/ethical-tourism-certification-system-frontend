export const selectAuthState = (state) => state.auth
export const selectAuthUser = (state) => state.auth.user
export const selectAuthToken = (state) => state.auth.token
export const selectAuthStatus = (state) => state.auth.status
export const selectAuthError = (state) => state.auth.error
export const selectIsAuthInitializing = (state) => state.auth.isInitializing
export const selectIsAuthenticated = (state) => Boolean(state.auth.token && state.auth.user)

