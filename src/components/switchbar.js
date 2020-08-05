/*
 * \file switchbar.js
 * \date 2020 - 7 - 9
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
 *
 * \section Description
 */

import React from 'react'
import { Button, message, Radio, Space} from 'antd'
import { Link } from 'react-router-dom'
import { Row, Col } from 'antd'

class SwitchBar extends React.Component {
  render () {
    return (
      <>
        <Space>
          <Button >
            <Link to="/ViewPage">3D Visualization</Link>
          </Button>
          <Button >
            <Link to="/AnalyzePage">2D Analyzing</Link>
          </Button>
        </Space>
      </>
    )
  }
}

export default SwitchBar
