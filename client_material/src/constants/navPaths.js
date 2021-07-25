import { Calc, History } from '../components';

export const navPaths = {
  calc: {
    path: '/',
    label: 'Калькулятор',
    component: <Calc />
  },
  history: {
    path: '/history',
    label: 'История',
    component: <History />
  }
}
