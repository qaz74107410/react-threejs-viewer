import React from 'react';
import {render} from 'react-dom';
import App from './app';

import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import "mdbreact/dist/css/mdb.css";

const root = document.createElement('div');
document.body.append(root);

render(<App/>, root);
