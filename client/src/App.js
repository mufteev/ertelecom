import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, NavLink, Route, Switch } from 'react-router-dom';
import Calc from './components/Calc';
import History from './components/History';

function App() {
  return (
    <Router>
      <>
        <nav className="nav nav-tabs justify-content-center">
          <div className="nav-item">
            <NavLink className="nav-link" activeClassName="active" to="/" exact>Калькулятор</NavLink>
          </div>
          <div className="nav-item">
            <NavLink className="nav-link" activeClassName="active" to="/history">История</NavLink>
          </div>
        </nav>
      </>
      <>
        <Switch>
          <Route exact path="/">
            <Calc/>
          </Route>
          <Route path="/history">
            <History/>
          </Route>
          <Route path="*">
            <div className="text-center mt-4">
              Страница не найдена
            </div>
          </Route>
        </Switch>
      </>
    </Router>
  );
}

export default App;
