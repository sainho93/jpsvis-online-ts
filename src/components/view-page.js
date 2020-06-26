/*
 * \file view-page.js
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
import SwitchBar from './switchbar'
import './view-page.css'
import { Row, Col } from 'antd'
import init from '../geometry/initialization';
import startScene from '../geometry/datamanager';

import { Layout, Menu } from 'antd';
const { Header, Content, Footer} = Layout;

class ViewPage extends React.Component {
  // Load Three.JS after <canvas/> node is mounted into DOM
  componentDidMount(){
    (async () => {
        const initResources = await init();
        startScene(initResources);
      }
    )();
  }

  render () {
    return (
      <Layout className="view-page-layout">
        <Content className="view-page-layout-content">
          <div id="canvas" >
          </div>
        </Content>
        <Footer/>
      </Layout>
    )
  }
}

export default ViewPage
