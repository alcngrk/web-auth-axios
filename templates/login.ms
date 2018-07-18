<!DOCTYPE html>
<html>
  <head>
      <title>Login Page</title>
      <link rel="stylesheet" href="/css/style.css">
  </head>
  <body>
    <form method="POST" action="/login.html">
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
        <input name="submit" class="control" value="Login" type="submit">
    </form>
    <p><a href="/register.html">Register</a></p>
  </body>
</html>
