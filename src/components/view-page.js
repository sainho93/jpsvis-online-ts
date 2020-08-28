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

import { Button, Cascader, Layout, Space, Modal, Image} from 'antd'
import Dragger from 'antd/es/upload/Dragger'
import Sider from 'antd/es/layout/Sider'
const { Content } = Layout;
import { InboxOutlined } from '@ant-design/icons'
import axios from 'axios'

class ViewPage extends React.Component {
  state = {
    url: '',
    selectedFile: null,
    imgData: '',

    visible: false,
  }

  // Load Three.JS after <canvas/> node is mounted into DOM
  // Load 3D view as default
  componentDidMount(){
    (async () => {
        const initResources = await init();
        this.jps3D = new JPS3D(initResources.geometryRootEl, initResources);
      }
    )();
  }

  // Set url of state
  diagrammChanged = (value) => {
    this.setState(prevState => ({url: value}))
  }

  onChangeHandler=event => {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0
    })
  }

  // Handlers for modal
  handleOk = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  // Fetch base64 data of plot depends on url
  toggleOpened() {
    fetch(this.state.url)
      .then(response => response.text())
      .then(data => {
        this.setState(prevState => ({imgData: data}))
      });

    this.setState({
      visible: true,
    });
  }

  // Dragger uses rc-upload component
  // custom upload method to upload files
  uploadToLocal = async options => {
    const data = new FormData()
    const { onSuccess, onError, file } = options

    data.append('file', this.state.selectedFile)

    axios
      .post('http://localhost:8080/upload', data, {})
      .then(res => {
        onSuccess(file)
        console.log(res)
      })
      .catch(err => {
        const error = new Error('Some error')
        onError({ event: error })
      })
  }

  render () {
    const diagrammOptions = [
      {
        value: 'N_t',
        label: 'N-t Diagram'
      },
      {
        value: 'density_velocity',
        label: 'Density - Velocity',
        children: [
          {
            value: 'D_V_Method_C',
            label: 'Method C'
          },
          {
            value: 'D_V_Method_D',
            label: 'Method D'
          }
        ]
      },
      {
        value: 'density_flow',
        label: 'Density - Specific flow',
        children: [
          {
            value: 'D_Js_Method_C',
            label: 'Method C'
          },
          {
            value: 'D_Js_Method_D',
            label: 'Method D'
          }
        ]
      },
      {
        value: 'voronoi',
        label: 'Voronoi Diagram',
        children: [
          {
            value: 'density_voronoi',
            label: 'Density',
          },
          {
            value: 'velocity_voronoi',
            label: 'Velocity'
          }
        ]
      },
      {
        value: 'profiles',
        label: 'Spatiotemporal Profiles',
        children: [
          {
            value: 'p_density',
            label: 'Density'
          },
          {
            value: 'p_velocity',
            label: 'Velocity'
          }
        ]
      }
    ]

    return (
      <Layout className="view-page-layout">
        <Sider width={"25%"} theme={"light"} className="view-page-sider">
          <Space direction="vertical" align="center">
            <div onChange={this.onChangeHandler}>
              <Dragger accept='.xml, .dat, .txt' customRequest={this.uploadToLocal}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag output files from JPSReport to this area to upload</p>
              </Dragger>
            </div>
            <>
              <Space>
                <Cascader options={diagrammOptions} onChange={this.diagrammChanged}/>
                <Button onClick={() => this.toggleOpened()}>
                  Start Plot
                </Button>
                <Modal title={this.state.url} visible={this.state.visible}
                       onOk={this.handleOk} onCancel={this.handleCancel} width={700}>
                  <img src ={"data:image/png;base64," + this.state.imgData} width={500}/>
                </Modal>
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
