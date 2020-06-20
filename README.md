# <fw-jobs>

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

Include this webcomponent to display Fuqua Volunteer Corps job postings.

Module dependencies:
 @fsb/fw-auth -> requires JWT authentication

Module attributes:
 base - indicates what server XHR requests should be made.

## Installation
```bash
npm i @fsb/fw-jobs
```

## Usage
```html
<script type="module">
  import '@fsb/fw-jobs/dist/fw-jobs.js';
</script>

<fw-jobs></fw-jobs>
```

## Screen Shot
![Screen Shot of Application](./screen_shot.png?inline=true)



FRONT END

Component #1:  fw-auth
Component #2:  fw-jobs (a suite of components)

BACK END

There are 5 functional end points; however, because we are using a CouchDB
instance the two save endpoints are actually one endpoint because the payload
contains all the data necessary to distinctly save the data (each type of object 
is stored as a document so it is consistent and distinct-- if you convert these
endpoints to use a different data source such as an RDBMS you might prefer to 
create distinct endpoints for these... but you will need to have your endpoints
create and parse these JSON document structures).

Get the application configuration data:

Get the list of jobs:

Save the application configuration data:

Save a job posting:

Delete a job posting:





