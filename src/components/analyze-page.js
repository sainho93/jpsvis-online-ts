/*
 * \file analyze-page.js
 * \date 2020 - 6 - 22
 * \author Tao Zhong
 * \copyright <2009 - 2020> Forschungszentrum Jülich GmbH. All rights reserved.
 *
 * \section License
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
import './analyze-page.css'
import { Layout } from 'antd'
import init from '../initialization'

const { Content, Footer} = Layout;

class AnalyzePage extends React.Component {
  // Load Three.JS after <canvas/> node is mounted into DOM
  componentDidMount(){
    (async () => {
        const initResources = await init();
      }
    )();
  }
  render () {
    return (
      <Layout >
        <Content >
          <div id="canvas" className="analyze-page-canvas"/>
        </Content>
        <Footer className="analyze-page-layout-footer">
          <SwitchBar/>
        </Footer>
      </Layout>
    )
  }
}

export default AnalyzePage
