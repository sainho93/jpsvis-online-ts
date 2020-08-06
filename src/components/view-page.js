/*
 * \file view-page.js
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
import './view-page.css'
import init from '../initialization';
import JPS3D from '../3Dvisualization/JPS3D'

import { Button, Cascader, Layout, Space } from 'antd'
import Dragger from 'antd/es/upload/Dragger'
import Sider from 'antd/es/layout/Sider'
const { Content, Footer} = Layout;
import { InboxOutlined } from '@ant-design/icons'

class ViewPage extends React.Component {
  // Load Three.JS after <canvas/> node is mounted into DOM
  componentDidMount(){
    (async () => {
        const initResources = await init();
        this.jps3D = new JPS3D(initResources.geometryRootEl, initResources);
      }
    )();
  }

  // Remove dat.gui menus when change pages
  componentWillUnmount () {
    const guiMenus = document.getElementsByClassName('dg main a');

    for(let i = guiMenus.length - 1; i>=0; i--){
      guiMenus[i].parentNode.removeChild(guiMenus[i]);
    }
  }

  render () {
    return (
      <Layout className="view-page-layout">
        <Sider width={"25%"} theme={"light"} className="view-page-sider">
          <Space direction="vertical" align="center">
            <Dragger>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag output files from JPSReport to this area to upload</p>
            </Dragger>
            <>
              <Space>
                <Cascader options={this.options}/>
                <Button>Start Plot</Button>
              </Space>
            </>
          </Space>
        </Sider>

        <Layout className="view-page-layout">
          <Content className="view-page-layout-content">
            <div id="canvas" className="view-page-canvas"/>
          </Content>
        </Layout>
      </Layout>
    )
  }
}

export default ViewPage
