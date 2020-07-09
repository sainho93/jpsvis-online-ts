/*
 * \file index.tsx
 * \date 2020 - 6 - 16
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

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import App from './components/App'

(async () => {
  const render = () => {
    ReactDOM.render(
      <App />,
      document.getElementById('root')
    )
  }
  render()

})().catch(e => {
  const h = document.createElement('H1')
  h.innerText = '500 Server Error'
  document.body.appendChild(h)
  console.error(e)
})
