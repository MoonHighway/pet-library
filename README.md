<p align="center">
<img src="https://i.imgur.com/RJzoZMg.png" width="100" alt="cat"/>
<img src="https://i.imgur.com/68QPxcs.png" width="100" alt="dog"/>
<img src="https://i.imgur.com/GhRyeU5.png" width="100" alt="rabbit"/>
</p>

# Pet Library API

## Overview

The Pet Library is a real pet library checkout system for a fake pet library. The purpose of the Pet Library is to teach developers how to work with the GraphQL Query Language and how to send queries, mutations, and subscriptions to this API.

## Installation

### 1. Clone or download this repository.

```
git clone https://github.com/moonhighway/pet-library.git
cd pet-library
```

### 2. Install the dependencies.

```
npm install
```

Or use yarn:

```
yarn
```

### 3. Set up Mongo locally.

This project will use Mongo as a database. If you aren't a user of Mongo already, you can install Mongo locally, or use [mLab](https://mlab.com), a cloud-based version of Mongo, for this app.

For further installation instructions, check out these resources:

- [Mongo Installation for Mac](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
- [Mongo Installation for PC](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
- [Local Instructions for Mongo & mLab](https://gist.github.com/eveporcello/e80a90f39de3b63a9c20136536f477df)

### 4. Add a `.env` file to the root of your project.

You will need to add variables for `MONGODB_URI` and `SECRET`.

- `MONGODB_URI` is the route where your installation of Mongo is running. This usually runs at `mongodb://localhost:27017/pet-library`.
- `SECRET` is just a text string (can be anything) so that the user auth works as expected:

```
MONGODB_URI=<YOUR_MONGO_URI_HERE>
SECRET=<YOUR_AUTH_SECRET_HERE>
```

## Starting the Project - Dev Mode

Run the following command: `npm run dev`.

This project was created by [Alex Banks](http://twitter.com/moontahoe) and
[Eve Porcello](http://twitter.com/eveporcello) from
[Moon Highway](https://www.moonhighway.com).
