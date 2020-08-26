/*
 * \file upload-page.js
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
import axios from 'axios'
import { Link } from 'react-router-dom'

import './upload-page.css'

import { Steps, Button, message, Upload, Layout, Menu } from 'antd'
import { InboxOutlined, LinkOutlined, ReloadOutlined } from '@ant-design/icons'

const { Header, Content, Footer } = Layout

const { Step } = Steps

const { Dragger } = Upload

const steps = [
  {
    title: 'Upload Geometry XML file'
  },
  {
    title: 'Upload Trajectory TXT file'
  }
]

// props for dragger
const dragger = {
  name: 'file',
  multiple: true,

  onChange (info) {
    const { status } = info.file

    if (status !== 'uploading') {
      console.log(info.file, info.fileList)
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`)
      console.log('file uploaded successfully')
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`)
      console.log('file uploaded failed')
    }
  }
}

class UploadPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      current: 0,
      selectedFile: null
    }
  }

  /* Event handlers */
  onChangeHandler=event => {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
    })
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

  next () {
    // move to next step
    const current = this.state.current + 1
    this.setState({ current })
  }

  prev () {
    const current = this.state.current - 1
    this.setState({ current })
  }

  render () {
    const { current } = this.state
    return (
      <Layout className='upload-page-layout'>
        <Header>
          <span className='upload-page-header'>JPSvis Online</span>
          <Menu theme="dark" mode="horizontal">
            <Menu.Item key="1" icon={<ReloadOutlined/>} >
              Start Over
            </Menu.Item>
            <Menu.Item key="2" icon={<LinkOutlined/>}> About JPSvis</Menu.Item>
          </Menu>
        </Header>
        <Content className='upload-layout-content'>
          <div>
            <Steps current={current}>
              {steps.map(item => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>
            <div className="steps-content" onChange={this.onChangeHandler}>
              <Dragger {...dragger} accept='.xml, .txt' customRequest={this.uploadToLocal}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support only for xml files of JuPedSim
                </p>
              </Dragger>
            </div>
            <div className="steps-action">
              {current < steps.length - 1 && (
                <Button type="primary" onClick={() => this.next()}>
                  Next
                </Button>
              )}
              {current === steps.length - 1 && (
                <Button type="primary" onClick={() => message.success('Processing complete!')}>
                  <Link to="/ViewPage">Start Visualization</Link>
                </Button>
              )}
              {current > 0 && (
                <Button style={{ margin: '0 8px' }} onClick={() => this.prev()}>
                  Previous
                </Button>
              )}
            </div>
          </div>
        </Content>
        <Footer className='upload-layout-footer'>
          <div >
            ©2020 JuPedSim. All rights reserved.
          </div>
        </Footer>
      </Layout>
    )
  }
}

export default UploadPage
