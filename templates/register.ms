<!DOCTYPE html>
<html>
  <head>
      <title>Register Page</title>
      <link rel="stylesheet" href="/css/style.css">
  </head>
  <body>
    <form method="POST" action="/register.html">
      <label>
        <span class="label">First Name</span>
        <input name="firstName" class="control" value="{{firstName}}"><br>
        {{#fNameError}}<span class="error">{{fNameError}}<br></span>{{/fNameError}}
      </label>
      <label>
        <span class="label">Last Name</span>
        <input name="lastName" class="control" value="{{lastName}}"><br>
        {{#lNameError}}<span class="error">{{lNameError}}<br></span>{{/lNameError}}
      </label>
      <label>
        <span class="label">User e-mail</span>
        <input name="username" class="control" value="{{email}}"><br>
        {{#uNameError}}<span class="error">{{uNameError}}<br></span>{{/uNameError}}
        {{#regexError}}<span class="error">{{regexError}}<br></span>{{/regexError}}
      </label>
      <label>
        <span class="label">Password</span>
        <input name="pw" class="control"><br>
        {{#pwError}}<span class="error">{{pwError}}<br></span>{{/pwError}}
        {{#pwNoDigitErr}}<span class="error">{{pwNoDigitErr}}<br></span>{{/pwNoDigitErr}}
        {{#pwSpaceErr}}<span class="error">{{pwSpaceErr}}<br></span>{{/pwSpaceErr}}
        {{#pwLengthErr}}<span class="error">{{pwLengthErr}}<br></span>{{/pwLengthErr}}
      </label>
      <label>
        <span class="label">Confirm Password</span>
        <input name="cPw" class="control"><br>
        {{#cPwErr}}<span class="error">{{cPwErr}}<br></span>{{/cPwErr}}
      </label>
        <input name="submit" class="control" value="Register" type="submit">
    </form>
    <p><a href="/login.html">Login</a></p>
  </body>
</html>
