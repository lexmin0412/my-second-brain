import ReactDOM from 'react-dom/client'
import App from './App'
import './index.less'
import { BrowserRouter } from "pure-react-router";
import { routeList } from './routes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename='/my-second-brain' routes={routeList}>
    <App />
  </BrowserRouter>
)
