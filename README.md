
# DEEL BACKEND TASK

  

💫 Welcome! 🎉

  

This backend exercise involves building a Node.js/Express.js app that will serve a REST API. We imagine you should spend around 3 hours at implement this feature.

  

## Data Models

  

>  **All models are defined in src/model.js**

  

### Profile

  

A profile can be either a `client` or a `contractor`.

clients create contracts with contractors. contractor does jobs for clients and get paid.

Each profile has a balance property.

  

### Contract

  

A contract between and client and a contractor.

Contracts have 3 statuses, `new`, `in_progress`, `terminated`. contracts are considered active only when in status `in_progress`

Contracts group jobs within them.

  

### Job

  

contractor get paid for jobs by clients under a certain contract.

  

## Getting Set Up

  

The exercise requires [Node.js](https://nodejs.org/en/) to be installed. We recommend using the LTS version.

  

1. Start by creating a local repository for this folder.

  

1. In the repo root directory, run `npm install` to gather all dependencies.

  

1. Next, `npm run seed` will seed the local SQLite database. **Warning: This will drop the database if it exists**. The database lives in a local file `database.sqlite3`.

  

1. Then run `npm start` which should start both the server and the React client.

  

❗️ **Make sure you commit all changes to the master branch!**

  

## Technical Notes

  

- The server is running with [nodemon](https://nodemon.io/) which will automatically restart for you when you modify and save a file.

  

- The database provider is SQLite, which will store data in a file local to your repository called `database.sqlite3`. The ORM [Sequelize](http://docs.sequelizejs.com/) is on top of it. You should only have to interact with Sequelize - **please spend some time reading sequelize documentation before starting the exercise.**

  

- To authenticate users use the `getProfile` middleware that is located under src/middleware/getProfile.js. users are authenticated by passing `profile_id` in the request header. after a user is authenticated his profile will be available under `req.profile`. make sure only users that are on the contract can access their contracts.

- The server is running on port 3001.

  

## APIs To Implement

  

Below is a list of the required API's for the application.

  

1.  **_GET_**  `/contracts/:id` - This API is broken 😵! it should return the contract only if it belongs to the profile calling. better fix that!

  

1.  **_GET_**  `/contracts` - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.

  

1.  **_GET_**  `/jobs/unpaid` - Get all unpaid jobs for a user (**_either_** a client or contractor), for **_active contracts only_**.

  

1.  **_POST_**  `/jobs/:job_id/pay` - Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.

  

1.  **_POST_**  `/balances/deposit/:userId` - Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)

  

1.  **_GET_**  `/admin/best-profession?start=<date>&end=<date>` - Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.

  

1.  **_GET_**  `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` - returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.

  

```

[

{

"id": 1,

"fullName": "Reece Moyer",

"paid" : 100.3

},

{

"id": 200,

"fullName": "Debora Martin",

"paid" : 99

},

{

"id": 22,

"fullName": "Debora Martin",

"paid" : 21

}

]

```

  

## Going Above and Beyond the Requirements

  

Given the time expectations of this exercise, we don't expect anyone to submit anything super fancy, but if you find yourself with extra time, any extra credit item(s) that showcase your unique strengths would be awesome! 🙌

  

It would be great for example if you'd write some unit test / simple frontend demostrating calls to your fresh APIs.

  

## Submitting the Assignment

  

When you have finished the assignment, zip your repo (make sure to include .git folder) and send us the zip.

  

Thank you and good luck! 🙏


## Developer notes
1. Some features do not work properly with Sqlite. I found that locking a row doesn't have any effect, and from what I could see it is because Sqlite does not support it. I haven't investigated this further. I left some comments in the code.
2. I have used `jest` and `supertest` to create a simple suite of integration tests. For that, I have modified the `seedDb.js` script to insert some more records. Running tests can be done using `npm run test`. The database is wiped before each suite run. In order to have more bulletproof test strucutre, some modifications can be done, but I tried to keep it really simple.
3. I am not sure I correctly understood what the `/balances/deposit/:userId` should do. I implemented it the way I viewed it and left some comments in the code.
4. I though about modifiyng the data model to differentiate between an admin user and a regular user. This can be done, but due to time constraints, I chose not to do it.
5. In terms of code structure, a separation in services and controllers would be much better than what I did, but I tried to modify the code structure as little as possible.