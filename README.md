# <fw-jobs>

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

Include this webcomponent to display Fuqua Volunteer Corps job postings.

This branch is an unauthenticated version of the application.  If you use 
cookies for authentication purposes, the endpoints will pass those cookies
along the request so you can authenticate the requests outside of the scope
of the front end.  As the front end will not know who the user is, you will
want to configure two different URLs-- one for viewing and one for administration.

There is an authenticated version of the application available on a branch 
called "authenticated".  It uses another component called fw-auth which is 
used to verify authentication and pull profile data about the user.  In this 
version one-end point is used for both users and administrators.

## LIVE DEMO

User view:  https://go.fuqua.duke.edu/apps/fvcdemo/index.html
Admin view: https://go.fuqua.duke.edu/apps/fvcdemo/admin.html

Module attributes:
 role - "admin" or "user", defaults to "user"

## Installation
```bash
npm i @fuquaschoolofbusiness/fw-jobs
```

## Usage
```html
<script type="module">
  import '@fuquaschoolofbusiness/fw-jobs/dist/fw-jobs.js';
</script>

<fw-jobs></fw-jobs>
```

## Screen Shot
![Screen Shot of Application](./screen_shot.png?inline=true)


## BACK END

There are 5 functional end points the components calls:

Get the application configuration data:
GET https://go.fuqua.duke.edu/fuqua_link/rest/jobs/demo/configuration

Get the list of jobs:
GET https://go.fuqua.duke.edu/fuqua_link/rest/jobs/demo/postings

Save the application configuration data:
POST https://go.fuqua.duke.edu/fuqua_link/rest/jobs/demo/configuration

Save/create a job posting:
POST https://go.fuqua.duke.edu/fuqua_link/rest/jobs/demo/postings

Delete a job posting:
DELETE https://go.fuqua.duke.edu/fuqua_link/rest/jobs/demo/postings


There may be constraints on these demo services that prevent you from 
saving or deleting job postings.   You will need to replace these 
endpoints to make this service work for you.  Do NOT try to use these 
endpoints for your own purposes.  There is no guarantee they will be 
available.

There is a sample Java web services servlet (JobPostings.java)
in the server folder that mirrors our implementation that uses a 
CloudantDB server.

## DATA

In the server folder, you can see what the raw data looks like for a couple
of the services.  The configuration.json is the application configuration
details which you must initialize in your database since there is no method
in the application to produce this-- and it has critical data that is expected
by the application (the list of fields for example).   There is also a 
jobs.json file which shows you what is pulled from the database when calling
all the job listings.   The jobs are each stored as separated entities, but 
they are aggregated by the service before being sent down.   There is no
endpoint to call for an individual job listing.

## DEPLOYMENT

If you make no changes, you should be able to deploy this application with
the anonymous data demo endpoints anywhere you like following these steps:

1) build the component -> 1) npm install, 2) npm run build (you only need to 
do the npm install the first time)

2) create a web-accessible folder/url and create an empty index.html file.

3) copy the froala folder from the project into this folder and the css folder.

4) copy the dist folder from the project into this folder as well.

5) edit the index.html  as follows:

    <html>
        <head>
            <title>Project Opportunities</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="stylesheet" type="text/css" href="css/fvc.css">
            <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
            <!-- Froala -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css">
            <link rel="stylesheet" href="froala_editor_3.1.1/css/froala_editor.pkgd.min.css"> 
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/codemirror.min.css">
            <script type="text/javascript"
                src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/codemirror.min.js"></script>
            <script type="text/javascript"
                src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/mode/xml/xml.min.js"></script>
            <script type="text/javascript" src="froala_editor_3.1.1/js/froala_editor.pkgd.min.js"></script>
            <!-- End Froala -->         
        </head>
        <body>
            <fw-jobs role="user"></fw-jobs>
            <script type="module" src="./dist/fw-jobs.js"></script>
        </body>
    </html>

If you want to allow compatibility with older browsers and browsers that do not
fully support ES6, use the pollyfills to pull in the script by replacing the module
script tag with:


