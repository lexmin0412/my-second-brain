import "./App.css";
import {useHistory, Route} from "pure-react-router";
import {useEffect} from "react";
import {routeList} from "./routes";
import LayoutHeader from "./components/layout/header";

function App() {
  const history = useHistory();
  const pathname = history.location.pathname;

  useEffect(() => {
    if (!pathname || pathname === "/") {
      history.push(routeList[0].path);
    }
  }, [pathname]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <LayoutHeader />
      <div className="flex-1 overflow-hidden">
        <Route />
      </div>
    </div>
  );
}

export default App;
