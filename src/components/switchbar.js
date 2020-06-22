/*
 * \file switchbar.js
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
import { Radio } from 'antd'
import { Link } from 'react-router-dom'

class SwitchBar extends React.Component {
  render () {
    return (
      <Radio.Group buttonStyle="solid">
        <Radio.Button value="a">
          <Link to='ViewPage'>
            Simulation
          </Link>
        </Radio.Button>
        <Radio.Button value="b">
          <Link to='AnalyzePage'>
            Analyzing
          </Link>
        </Radio.Button>
      </Radio.Group>
    )
  }
}

export default SwitchBar
