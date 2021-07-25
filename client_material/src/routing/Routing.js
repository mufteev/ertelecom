import { navPaths } from '../constants';
import { Tabs, Tab, CssBaseline } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import { useCallback, useMemo, useState } from 'react';
import { Link, BrowserRouter as Router, Switch, Route } from 'react-router-dom';

const nav = Object.keys(navPaths).map((x) => navPaths[x]);

export const Routing = () => {
  const [value, setValue] = useState(0);

  const memoNavTab = useMemo(() => nav.map((x, i) =>
      <Tab value={ i } to={ x.path } key={ x.path } label={ x.label } component={ Link }/>),
    []);
  const memoRoute = useMemo(() => nav.map(x =>
      <Route exact key={ x.path } path={ x.path }>{ x.component }</Route>)
    , []);

  const onChangeTab = useCallback((e, v) => setValue(v), []);

  return (
    <Router>
      <CssBaseline/>
      <AppBar position="static">
        <Tabs value={ value } onChange={ onChangeTab }>
          { memoNavTab }
        </Tabs>
      </AppBar>
      <Switch>
        { memoRoute }
        <Route path="*">
          <div className="text-center mt-4">
            Страница не найдена
          </div>
        </Route>
      </Switch>
    </Router>
  )
}
