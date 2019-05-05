# CodeScrobble

CodeScrobble is a web application that makes it easy to scrobble your CD or vinyl records to Last.fm by scanning the barcode with your smartphone camera.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

In order to run a local version of the application you need to install the following tools:

- [NVM](https://github.com/nvm-sh/nvm) or Node.js (v10.15.1)
- [Yarn](https://github.com/yarnpkg/yarn) for npm package handling
- [MongoDB](https://github.com/mongodb/mongo) as Database
- [Redis](https://github.com/antirez/redis) as key-value store for session handling

### APIs

In addition to the software requirements, you need access to the following APIs:

- [Discogs](https://www.discogs.com/applications/edit) for searching and getting release info
- [Last.fm](https://www.last.fm/api/account/create) for authentication and scrobbling data


### Installing

First you need to clone the repository from github:

```
git clone git@github.com:dpuscher/code-scrobble.git
cd code-scrobble
```

When you are using `nvm` to manage your node installation use these commands to install and use the correct version

```
nvm install
nvm use
```

Afterwards you need to install all dependencies:

```
yarn install
```

### Configuration

To configure your application you need to set some environment variables. To do this easily you can just add a `.env` file in the root directory:

```
DISCOGS_KEY=...
DISCOGS_SECRET=...
LASTFM_KEY=...
LASTFM_SECRET=...
MONGODB_URI=mongodb://localhost:27017/codescrobble
REDISCLOUD_URL=redis://localhost:6379
SERVER_URL=http://localhost:3000
SESSION_SECRET=...
```

Discogs and Last.Fm Keys and Secrets are received from the developer websites mentioned above.

The session secret is used to sign the session id cookie and can be any string you want.

### Running the application

To run the application with hot-releading you can run it in development mode:

```
yarn dev
```

CodeScrobble is now accessible at http://localhost:3000

You can adjust the port by setting the `PORT` environment variable.

## Running the tests

Jest is used as a test runner in this project:

```
yarn test
```

You can also use watch-mode and display the current test coverage:
```
yarn test:watch
yarm test:coverage
```

### Coding style tests

`ESLint` and `stylelint` are used to check the coding style of the project:

```
yarn lint
yarn lint:css
```

## Deployment

To deploy the project on a live system you just need to check it out on your server, install the dependencies (see "Installation"), add the config file and run the following commands:

```
yarn build
yarn start
```

## Authors

* **Daniel Puscher** - *Initial work* - [dpuscher](https://github.com/dpuscher)

See also the list of [contributors](https://github.com/dpuscher/code-scrobble/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
