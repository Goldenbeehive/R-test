import './App.css'
import { useDashboardController } from './controllers/useDashboardController'
import LoginView from './views/LoginView'
import DashboardView from './views/DashboardView'

function App() {
  const controller = useDashboardController()

  return controller.token ? <DashboardView {...controller} /> : <LoginView {...controller} />
}

export default App
