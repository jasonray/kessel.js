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

| Field | Optional/Request | Description |
| --- | --- | --- |
| id | requred | unique identifier, created by Kessel job manager |
| ref | optional | identifier, create by job producer |
| type | required | job type is used to map to a specific handler |
| expiration | optional | Specifies the latest that a job may be processed.  This is provided as an absolute date/time as a JavaScript date (2012-04-23T18:25:43.511Z) |
| delay | optional | Specifies the earliest that a job may be processed.  This is provided as an absolute date/time as a JavaScript date (2012-04-23T18:25:43.511Z) |
| priority | optional | Specifies the order by which jobs will be processed.  0 is the highest priority, the lowest priority being approx 4M.  Negative numbers are treated as 0 |
| callback | optional | If a callback is provided it will be invoked when job is complete.  This is currently implemented with a JavaScript function callback ```function(err)```.  Pending: callbacks using HTTP endpoint |
| payload | optional | The payload is the content to pass to the handler |

# jobResult Model

jobResult Model
---------------
| Field | Optional/Request | Description |
| --- | --- | --- |
| TODO: id | requred | unique identifier of result |
| TODO: requet | requred | original request |
| value | optional | if the handler reported a single value, this will be populated here |
| status | required | The result of processing the message, valid values are `success`,`failed`,`failed-transient` |
| message | optional | This can be populated with the error message or other human-readable informative information |

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


