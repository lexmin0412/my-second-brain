import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Home from './home';
import Doc from "./doc";
import './index.css'
import {BrowserRouter} from "pure-react-router";

export const routeList = [
  {
    path: "/home",
    component: Home,
  },
  {
    path: "/doc",
    component: Doc,
  },
];

ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter basename='' routes={routeList}>
			<App />
		</BrowserRouter>
  // </React.StrictMode>,
)
