import Home from './home'
import Doc from './doc'
import './App.css'
import { BrowserRouter, Route } from 'pure-react-router'

const routeList = [
  {
    path: "/home",
    component: Home,
  },
  {
    path: "/doc",
    component: Doc,
  },
];

function App() {
	return (
    <BrowserRouter basename='' routes={routeList}>
			<Route />
    </BrowserRouter>
  )
}

export default App
