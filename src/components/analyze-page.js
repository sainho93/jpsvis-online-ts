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
import { Button, Cascader, Layout, Space } from 'antd'
import init from '../initialization'
import Sider from 'antd/es/layout/Sider'
import Dragger from 'antd/es/upload/Dragger'
import { InboxOutlined } from '@ant-design/icons'

const { Content, Footer} = Layout;

class AnalyzePage extends React.Component {
  // Load Three.JS after <canvas/> node is mounted into DOM
  componentDidMount(){
    (async () => {
        const initResources = await init();
      }
    )();
  }


  options = [
    {
      value: 'demo',
      label: 'demo',
    }
  ]

  render () {
    return (
      <Layout className="analyze-page-layout">
        <Sider width={"25%"} theme={"light"} className="analyze-page-sider">
          <Space direction="vertical" align="center">
            <Dragger>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag output files from JPSReport to this area to upload</p>
            </Dragger>
            <Cascader options={this.options}/>
            <Button>Start Plot</Button>
            <Button>Download Plot</Button>
            <SwitchBar/>
          </Space>
        </Sider>
        <Layout>
          <Content >
          </Content>
        </Layout>
      </Layout>
    )
  }
}

export default AnalyzePage
