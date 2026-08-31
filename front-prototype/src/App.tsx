import { AppRouter } from '@/router'
import { CurrentUserProvider } from '@/session/CurrentUserContext'

function App() {
  return (
    <CurrentUserProvider>
      <AppRouter />
    </CurrentUserProvider>
  )
}

export default App
