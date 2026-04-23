import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import apisidebar from './docs/api/server/sidebar';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {type: 'doc', id: 'index', label: 'Home'},
    {type: 'doc', id: 'user-guide/index', label: 'User Guide'},
  ],
  apisidebar,
};

export default sidebars;
