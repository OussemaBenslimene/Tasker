import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'
import { Experimental_CssVarsProvider as CssVarsProvider, useTheme } from '@mui/material/styles'
import theme from './theme'
import { ConfirmProvider } from 'material-ui-confirm'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { Provider } from 'react-redux'
import { store } from '~/redux/store.js'

import { BrowserRouter } from 'react-router-dom'

import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import { injectStore } from '~/utils/authorizeAxios'

injectStore(store)
const persistor = persistStore(store)


function ThemedToastContainer() {
  const theme = useTheme()

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      newestOnTop
      theme={theme.palette.mode === 'dark' ? 'dark' : 'colored'}
    />
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <BrowserRouter basename='/'>
        <CssVarsProvider theme={theme}>
          <ConfirmProvider defaultOptions={{
            allowClose: false,
            dialogProps: { maxWidth: 'xs' },
            buttonOrder: ['confirm', 'cancel'],
            cancellationButtonProps: { color: 'inherit' },
            confirmationButtonProps: { color: 'secondary', variant: 'outlined' }
          }}>
            <GlobalStyles styles={{ a: { textDecoration: 'none' } }} />
            <CssBaseline />
            <App />
          </ConfirmProvider>
          <ThemedToastContainer />
        </CssVarsProvider>
      </BrowserRouter>
    </PersistGate>
  </Provider>
)
