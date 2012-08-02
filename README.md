:umbrella: Work in progress :umbrella:
----------------
This no longer matches the original stable version and is undergoing refactoring/rewriting.
You may still find the original version in cookiesdirective.com

Installation
================
```html
<script src="/path/to/cookiesdirective.js"></script>
<script>cookiesDirective.init();</script>
```

Configuration
================
`cookiesDirective.init()` can accept an object with the following parameters for configuration:

__Functionality/Positioning:__
* `domain` : Explicitely sets the cookie domain. E.g. host.com instead of yourcookieapp.host.com
* `repeatCount` : The number of times to display the banner before giving up. Defaults to 0 (never give up!).
* `position` : Where to place the banner ('top' or 'bottom'). Defaults to 'top'.
* `redirect` : Whether to redirect after accepting cookies or attempt to run js directly. Defaults to true.
* `displayTimeout` : The number of seconds to display the banner each time. Defaults to 9999.
* `cssPosition` : Either 'fixed' or 'absolute'. Defaults to 'fixed'

__Texts:__
* `policyUri` : The uri to point to for reading the policy. If not set no link will be printed.
* `thirdPartyApps` : Array of strings with the 3rd party apps that use cookies (for use by default texts)
* `disclosureHtml` : Overrides the default text (apart from the checkbox and button)
* `buttonLabel` : The text of the submit button
* `checkboxLabel` : The text next to the checkbox
* `agreementText` : The text reminding the user to tick the checkbox

*__Example:__*
```javascript
cookiesDirective.init({
    thirdPartyApps: ['Google Analytics', 'whatever'],
    policyUri: '/policy.html',
    redirect: false,
    displayTimeout: 3
});
```

Queueing for cookie acceptance
================
- An anonymous function
    ```javascript
    cookiesDirective.queue(function() {
        console.log('lambda');
    });
    ```

- An inline script
    ```html
    <script type="text/plain" class="cookie-directive-queue">
        console.log('test');
    </script>
    ```

- An external script
    ```html
    <script type="text/plain" class="cookie-directive-queue" src="http://hostname/example/file.js"></script>
    ```
    *Do not use this without redirection as many scripts depend on document-load events which might have already happened.*
    

Licence
================
Copyright (C) 2011 by Ollie Phillips

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.