import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Home from './home';
import Doc from "./docs";
import Notes from "./notes";
import './index.less'
import {BrowserRouter} from "pure-react-router";

export const routeList = [
  {
    path: "/home",
    component: Home,
  },
  {
    path: "/docs",
    component: Doc,
  },
  {
    path: "/notes",
    component: Notes,
  },
];

ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter basename='' routes={routeList}>
			<App />
		</BrowserRouter>
  // </React.StrictMode>,
)
