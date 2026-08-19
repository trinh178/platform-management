import datatableGuide from './datatable-guide/route-paths';
import employee from './employee/route-paths';
import formGuide from './form-guide/route-paths';
import appShell from './foundation/app-shell/route-paths';
import identity from './foundation/identity/route-paths';

const routePaths = {
  ...identity,
  ...appShell,
  ...formGuide,
  ...datatableGuide,
  ...employee,
};

export default routePaths;

export type AppPath = (typeof routePaths)[keyof typeof routePaths];
