import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useCallback, useState } from 'react';
import { navPaths } from '../../constants';


export const Navbar = () => {
  const [value, setValue] = useState(0);

  const onChangeTab = useCallback((e, v) => setValue(v), []);

  return (
    <Tabs value={ value } onChange={ onChangeTab }>
      <Tab key={navPaths.calc.description}
           component={}
           label={ navPaths.calc.description }>
      </Tab>
    </Tabs>
  )
}
