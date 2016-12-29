# kessel [![Build Status](https://travis-ci.org/jasonray/kessel.svg?branch=master)](https://travis-ci.org/jasonray/kessel)

"You've never heard of the Millennium Falcon?…It's the ship that made the Kessel Run in less than twelve parsecs."

# Background
Kessel is a lightweight framework for handling distributed delayed job processing.  This can be useful for any background jobs that you need within your application.

Consider the following scenarios:
- After a customer purchases items from your site, your system needs to process the order as a background job
- When a patient has a pending medication order, your system needs to perform medication/allergy checks
- As new metric data becomes available, periodically create derived data reports from raw data

# Features
- Architect can map **job type to handlers**
- Developers can **implement new handlers**
- Producers can **request jobs** to be processed
- Producers can specify **expiration** of job requests
- Producers can specify **delay** (earliest date/time to execute job) of `job requests`
- System automatically **retries on transient exceptions**, and **buries jobs** on fatal exceptions
- System will process requests based on **priority order**

# Concepts
- `job`: single delay processing tasks
- `job request`: request to Kessel to perform a single job in the future
- `handler`: the set of code to fulfil the `job request`.  This is where the extensibility of the system comes into play -> you create your own handlers with your logic and Kessel will delegate to your registered handlers.  Today, handlers are implemented in JavaScript
- `queue`: Kessel uses an internal queue for holding the `job requests` that have not yet been implemented.  Currently there is support for a light weight in memory queue or beanstalkd [http://kr.github.io/beanstalkd/].

# jobRequest Model

| Field | Optional/request | Description |
| id | requred | unique identifier, created by Kessel job manager |
| ref | optional | identifier, create by job producer |
| type | required | job type is used to map to a specific handler |
| expiration | optional | Specifies the latest that a job may be processed.  This is provided as an absolute date/time as a JavaScript date (2012-04-23T18:25:43.511Z) |

ref: identifier, filled in by producer

type: used to map to the handler

expiration: can be used to specify an expiration time.  This is provided as absolute date/time format, such as: 

delay: can be used to specify the earliest time to process job.  This is provided as absolute date/time format, such as: 2012-04-23T18:25:43.511Z

priority: number, with 0 being the highest priority.  Negative numbers are treated as 0, numbers over 4M are capped.

callback: either JS f or http endpoint

payload: payload is passed to the handler

jobResult Model
---------------
id: 
result: success|failed|failed-transient


Queue Adapter API
-----------------
enqueue(jobRequest, callback)
- jobRequest: see job request model
- callback(err, jobRequest)

dequeue(callback)
- where callback is a function(jobRequest, commit, rollback)
- jobRequest represents the job dequeued.  Will be null/empty if there was no item on the queue
- where commit is a function(commitComplete)
-- where, of course, commitComplete is a function indicating that commit is complete
- where rollback is a function(rollbackComplete)
-- where, of course, rollbackComplete is a function indicating that rollback is complete
- TODO: consider error queue and rollback with delay

# Developer Set up
First, make sure that you have `node`, `npm`, and `beanstalkd` installed.

If you do not, and are on a mac, here I recommend to first install Homebrew [http://brew.sh/], then install using: `brew install node` and `brew install beanstalkd`

Next, clone the source code from this repository [https://github.com/jasonray/kessel].

You will then need to setup dependencies: `npm install`

To run the unit tests: `npm test`
To run the integration tests, ensure that beanstalkd is running on port :3000 (which can be started with `bin/start-queue.sh`) then `npm run integration-test`


