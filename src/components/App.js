/*
 * \file App.js
 * \date 2020 - 6 - 22
 * \author Tao Zhong
 * \copyright <2009 - 2020> Forschungszentrum Jülich GmbH. All rights reserved.
 *
 * \section Lincense
 * This file is part of JuPedSim.
 *
 * JuPedSim is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 *  any later version.
 *
 * JuPedSim is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with JuPedSim. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'


import './App.css'
import UploadPage from '../components/upload-page'
import ViewPage from '../components/view-page'
import AnalyzePage from '../components/analyze-page'


const App = () => (
  <Router>
    <div id='page-container' className='pages-container'>
      <Switch>
        <Route exact={true} path='/' component={UploadPage}/>
        <Route path='/ViewPage' component={ViewPage}/>
      </Switch>
    </div>
  </Router>
)

export default App
