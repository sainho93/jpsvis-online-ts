# JPSvis Online

Visualization and analysis of geometry and trajectory data from [JuPedSim](https://www.jupedsim.org/index.html) in 3d
 in a web browser.

## TOC

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background
### Motivation
During the evacuation ,there is high potential safety risks where pedestrian density is high. Therefore, there is demand 
for pedestrian dynamic simulation tools to identify various evacuation scenarios. The current computing simulation 
software was developed with desktop systems in mind, however the web technology has evolved sufficiently to enable 
the development of professional software. The JPSvis Online is the web-based visualization and analysis tool as a part of 
[JuPedSim](https://www.jupedsim.org/index.html).

### Objective
* Visualization of geometry in 2D and 3D view
* Visualisation of trajectory files to present the evacuation process
* Plot diagrams from output files of JPSreport 

## Installation

### Download
This project is hosted on [Github](https://github.com/sainho93/jpsvis-online-ts.git).

As the program is still under development and is extended continuously, we advice you to use the latest sources from
 our GitHub repository. Using a command line client the following command should work:
    git clone --recursive https://github.com/sainho93/jpsvis-online-ts/

### Set-up
JPSvis Online is written in Python (Python3) for server and TypeScript for frontend.

To get going, we recommend setting up a Python virtual environment via [virtualenv](https://pypi.org/project
/virtualenv/):

    python -m venv $name_of_virtual_environment
    source $name_of_virtual_environment/bin/activate
    
Then install both Python and JS dependencies:

    pip3 install -r requirements.txt
    yarn

Now the JPSvis Online is ready to use

## Usage
To open the JPSvis Online in a web browser, build the client-side JavaScript bundle at first:

    yarn webpack
    
Then run the server:

    python ./src/server/server.py
    
Visit http://localhost:8080/ to use JPSvis Online

See more in [Getting Started](getting_started.md)


## Maintainers

- [sainho93](https://github.com/sainho93)

## Acknowledgements
JPSvis Online is inspired by [SUMO-Web3D](https://github.com/sainho93/sumo-web3d).

## Contributing

See [the contributing file](CONTRIBUTING.md)!

Feel free to dive in! [Open an issue](https://github.com/sainho93/jpsvis-online-ts/issues/new) or submit PRs.

JPSvis Online follows the [Contributor Covenant](http://contributor-covenant.org/version/1/3/0/) Code of Conduct.

## License
[GPLv3](LICENSE)
