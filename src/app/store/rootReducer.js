import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../../features/auth/store/authSlice'
import searchReducer from '../../features/search/store/searchSlice'
import auditReducer from '../../features/audit/store/auditSlice'
import certificateApplicationReducer from '../../features/certificate-application/store/certificateApplicationSlice'
import certificateManagementReducer from '../../features/certificate-management/store/certificateManagementSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  search: searchReducer,
  audit: auditReducer,
  certificateApplication: certificateApplicationReducer,
  certificateManagement: certificateManagementReducer,
})

export default rootReducer

