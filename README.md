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

### Objective

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
