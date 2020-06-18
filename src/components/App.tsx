/*
 * \file App.tsx
 * \date 2020 - 6 - 16
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

import * as React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { LinkOutlined, ReloadOutlined } from '@ant-design/icons'

import './App.css'

const { Header, Content, Footer } = Layout

export default class App extends React.Component<{}, {}> {
  render () {
    return (
      <Router>
        <Layout>
          {/* TODO: 高度自适应屏幕 */}
          <Header>
            <span className='site-page-header'>JPSvis Online</span>
            <Menu theme="dark" mode="horizontal">
              <Menu.Item key="1" icon={<ReloadOutlined/>} >
                Start Over
              </Menu.Item>
              <Menu.Item key="2" icon={<LinkOutlined/>}> About JPSvis</Menu.Item>
            </Menu>
          </Header>
          <Content>

          </Content>
          <Footer>

          </Footer>
        </Layout>
      </Router>
    )
  }
}

