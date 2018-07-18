#!/usr/bin/env nodejs

'use strict';

//nodejs dependencies
const fs = require('fs');
const process = require('process');

//external dependencies
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mustache = require('mustache');
const https = require('https');

//local dependencies
const options = require('./options');
const service = require('./service/service');

const STATIC_DIR = 'statics';
const TEMPLATES_DIR = 'templates';
const USER_COOKIE = 'userId';

/*************************** Route Handling ****************************/

function setupRoutes(app) {
  app.get('/', rootRedirectHandler(app));
  app.get('/login.html', loginHandler(app));
  app.post('/login.html', loginPostHandler(app));
  app.get('/register.html', registerHandler(app));
  app.post('/register.html', registerPostHandler(app));
  app.get('/logout.html', clearCookie(app));

  app.use('/user/:userId', bodyParser.json());
  app.get('/user/:userId', accountGetHandler(app));
}

//
//Triggers when a get request on the root is made.
//If theres no cookie(session) containing userId a redirect to login.html is made.
//Else a get request is done at proj3 with the url users/userId and with the
//proper header.
//
function rootRedirectHandler(app) {
  return function(req, res) {
    const userCookie = req.cookies[USER_COOKIE];
    if (typeof userCookie === 'undefined') {
      res.redirect('login.html');
    }
    else {
      let user = {};
      let view = {};
      user.userId = userCookie.userId;
      user.auth = userCookie.auth;
      app.service.getUser(user)
      .then((resp)=>{
        if(resp.info !== undefined)
        {
          view.error = resp;
          if(resp.status === 401)
          {
            //timeout, clear the old cookie.
            res.clearCookie(USER_COOKIE);
          }
          res.send(doMustache(app, 'error', view));
        }
        view.firstName = resp.firstName;
        view.lastName = resp.lastName;
        view.emailAdd = resp.username;
        view.userId = user.userId;
        res.send(doMustache(app, 'user', view));
      }).catch((err) =>
      {
        console.error(err);
        view.error = err;
        res.send(doMustache(app, 'error', view));
      });
    }
  };
}

//Used to implement the logout function.
//Simply deletes the user cookie.
function clearCookie(app)
{
  return function(req, res)
  {
    const userCookie = req.cookies[USER_COOKIE];
    if(typeof userCookie === undefined)
    {
      let view = {};
      view.status = 400;
      view.info = "Bad request. No valid session.";
      res.send(doMustache(app, 'error', view));
    }
    else
    {
      let view = {};
      view.userName = userCookie.userId;
      res.clearCookie(USER_COOKIE);
      res.send(doMustache(app, 'logout', view));
    }
  }
}


//
//Triggers when a get request is made at /user/:userId
//If there's a session it does a get request in an appropriate manner at proj3
//with user's info.
//
//If there's no session the user is redirected to login page.
//
function accountGetHandler(app)
{
  return function(req, res) {
    const userCookie = req.cookies[USER_COOKIE];
    if (typeof userCookie === 'undefined') {
      res.redirect('/login.html');
    }
    else if(userCookie.userId !== req.params.userId)
    {
      res.redirect('/login.html');
    }
    else {
      let user = {};
      let view = {};
      user.userId = userCookie.userId;
      user.auth = userCookie.auth;
      app.service.getUser(user)
      .then((resp)=>{
        if(resp.info !== undefined)
        {
          view.error = resp;
          if(resp.status === 401)
          {
            res.clearCookie(USER_COOKIE);
          }
          res.send(doMustache(app, 'error', view));
        }
        view.firstName = resp.firstName;
        view.lastName = resp.lastName;
        view.emailAdd = resp.username;
        view.userId = user.userId;
        res.send(doMustache(app, 'user', view));
      }).catch((err) =>
      {
        console.error(err);
        view.error = err;
        res.send(doMustache(app, 'error', view));
      });
    }
  };
}


//
//Tiggers when a get request is made on the /register
//Simply renders the register page on the browser.
//
function registerHandler(app)
{
  return function(req, res)
  {
    let view = {};
    res.send(doMustache(app, 'register', view));
  }
}

//
//Triggers when a post request is made on the /register path.
//Validates the input fields, if all goes well, triggers an appropriate request
//at proj3 with an appropriate json object. Creates a cookie with the users
//id and authentication token. Then redirects the user to /user/:userId path
//which can now render the page since there's a cookie it can use to login.
//
function registerPostHandler(app)
{
  return function(req, res)
  {
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const username = req.body.username.trim();
    const pw = req.body.pw.trim();
    const cPw = req.body.cPw.trim();

    const userId = username.substr(0,username.indexOf('@'));

    let errors = false;
    let view = {};

    if(typeof(firstName) === 'undefined' || firstName.trim().length === 0)
    {
      errors = true;
      view.fNameError = "First Name field can not be empty.";
    }
    if(typeof(lastName) === 'undefined' || lastName.trim().length === 0)
    {
      errors = true;
      view.lNameError = "Last Name field can not be empty.";
    }
    if(typeof username === 'undefined' || username.trim().length === 0){
      view.uNameError = 'Username can not be empty.';
      errors = true;
    }
    if(username.search(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.com/) === -1)
    {
      view.regexError = 'Username needs to be in username@xyz.com'
      errors = true;
    }
    if(typeof pw === 'undefined' || pw.trim().length === 0 )
    {
      view.pwError = 'Password field can not be empty.';
      errors = true;
    }
    if(pw.search(/\d/) === -1)
    {
      view.pwNoDigitErr = 'Password should have at least 1 digit in it.';
      errors = true;
    }
    if(pw.search(/\s/) !== -1)
    {
      view.pwSpaceErr = 'Password can not have space in it.';
      errors = true;
    }
    if(pw.length < 8)
    {
      view.pwLengthErr = 'Password must be at least 8 characters long.';
      errors = true;
    }
    if(typeof cPw === 'undefined' || cPw.trim().length === 0)
    {
      view.cPwErr = 'This field can not be empty.';
      errors = true;
    }
    else if(cPw !== pw)
    {
      view.cPwErr = 'Passwords do not match.'
      errors = true;
    }
    if(errors)
    {
      view.firstName = firstName; view.lastName = lastName; view.email = username;
      res.send(doMustache(app, 'register', view));
    }
    else
    {
      let user = {}; user.firstName = firstName; user.lastName = lastName;
      user.username = username; user.pw = pw;
      app.service.newUser(user)
      .then((resp) => {
        if(resp.info !== undefined)
        {
          view.error = resp;
          if(resp.status === 401)
          {
            //timeout, clear the old cookie.
            res.clearCookie(USER_COOKIE);
          }
          res.send(doMustache(app, 'error', view));
        }
        let user = {};
        user.auth = 'Bearer ' + resp.authToken;
        user.userId = username.substr(0,username.indexOf('@'));
        res.cookie(USER_COOKIE, user, { maxAge: 86400*1000 });
        res.redirect('/user/' + user.userId);
      });
    }
  }
}

//
//Triggers when a get request is done at the /login path
//Simply renders the login page.
//

function loginHandler(app) {
  return function(req, res) {
    let view = {};
    res.send(doMustache(app, 'login', view));
  }
}

//
//Triggers when a post request is done at the /login path
//validates the input fields. If all goes well, sends an appopriate request at
//proj3, gets back the authentication token, creates a cookie for the given token
//and redirects the user to /user/:userId path, which uses the cookie to get the
//resource.
//
function loginPostHandler(app) {
  return function(req, res){
    try
    {
      const username = req.body.username.trim();
      const pw = req.body.pw.trim();

      const userId = username.substr(0,username.indexOf('@'));

      let errors = false;
      let view = {};
      if(typeof username === 'undefined' || username.trim().length === 0){
        view.uNameError = 'Username can not be empty.';
        errors = true;
      }
      if(username.search(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.com/) === -1)
      {
        view.regexError = 'Username needs to be in username@xyz.com'
        errors = true;
      }
      if(typeof pw === 'undefined' || pw.trim().length === 0 )
      {
        view.pwError = 'Password field can not be empty.';
        errors = true;
      }
      if(pw.search(/\d/) === -1)
      {
        view.pwNoDigitErr = 'Password should have at least 1 digit in it.';
        errors = true;
      }
      if(pw.search(/\s/) !== -1)
      {
        view.pwSpaceErr = 'Password can not have space in it.';
        errors = true;
      }
      if(pw.length < 8)
      {
        view.pwLengthErr = 'Password must be at least 8 characters long.';
        errors = true;
      }
      if(errors)
      {
        view.email = username;
        res.send(doMustache(app, 'login', view));
      }
      else
      {
        let user = {};
        user.username = username;
        user.pw = pw;
        user.userId = username.substr(0,username.indexOf('@'));
      	app.service.authorizeUser(user)
      	  .then((json) => {
            if(json.info !== undefined)
            {
              view.error = json;
              if(json.status === 401)
              {
                //timeout, clear the old cookie.
                res.clearCookie(USER_COOKIE);
              }
              res.send(doMustache(app, 'error', view));
            }
            let user = {}
            user.auth = 'Bearer ' + json.authToken;
            user.userId = username.substr(0,username.indexOf('@'));
            res.cookie(USER_COOKIE, user, { maxAge: 86400*1000 });
            res.redirect('/user/' + user.userId);
          });
      }
    }catch(e)
    {
      view.error = e;
      console.error(e);
    }
  }
}


//
//function that does the rendering.
//

function doMustache(app, templateId, view) {
  const templates = {};
  return mustache.render(app.templates[templateId], view, templates);
}

/************************ Utility functions ****************************/

function errorPage(app, errors, res) {
  if (!Array.isArray(errors)) errors = [ errors ];
  const html = doMustache(app, 'errors', { errors: errors });
  res.send(html);
}

/*************************** Initialization ****************************/

function setupTemplates(app) {
  app.templates = {};
  for (let fname of fs.readdirSync(TEMPLATES_DIR)) {
    const m = fname.match(/^([\w\-]+)\.ms$/);
    if (!m) continue;
    try {
      app.templates[m[1]] =
	String(fs.readFileSync(`${TEMPLATES_DIR}/${fname}`));
    }
    catch (e) {
      console.error(`cannot read ${fname}: ${e}`);
      process.exit(1);
    }
  }
}

function setup() {
  let keyInsert = 'empty';
  let certInsert = 'empty';
  let dir = options.options.sslDir
  if(dir === '.' || dir === undefined)
  {
    keyInsert = fs.readFileSync('key.pem');
    certInsert = fs.readFileSync('cert.pem');
  }
  else
  {
    keyInsert = fs.readFileSync(dir + '/key.pem');
    certInsert = fs.readFileSync(dir + '/cert.pem');
  }

  process.chdir(__dirname);
  const port = options.options.port;
  const app = express();
  app.use(cookieParser());
  setupTemplates(app);
  app.service = service;
  app.service.set_url(options.options.ws_url);
  app.use(express.static(STATIC_DIR));
  app.use(bodyParser.urlencoded({extended: true}));
  setupRoutes(app);
  https.createServer({
      key: keyInsert,
      cert: certInsert,
    }, app).listen(port, function(){
      console.log("listening on port ", port ,"external server address", options.options.ws_url);
    });
}

setup();
