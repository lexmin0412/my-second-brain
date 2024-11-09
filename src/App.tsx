import './App.css'
import { useHistory, Route } from 'pure-react-router'
import { useEffect } from 'react';
import { routeList } from './main';

function App() {

	const history = useHistory()

	useEffect(()=>{
		if (!window.location.pathname || window.location.pathname === "/") {
			history.push(routeList[0].path)
    }
	}, [])

	return <Route />;
}

export default App
