Summary
================

This script provides a mechanism for gaining explicit 'consent to cookies' from your users, as well as a facility to prevent the creation of non 'necessary' cookies (like those created by third party javascripts such as Google Analytics) before the user has given their consent. Based on http://cookiesdirective.com/

Before using, make sure you're familiar with the license terms. This script is free to use, you can modify it, do whatever you want with it but, there's no warranty, express or implied. The usual stuff really. 

How to use
================
# Place this wrapper function html at the bottom of your page before the closing `</body>` tag. 
If you don't have any cookie creating scripts you're done on this step.
```html
<script type="text/javascript">
    function cookiesDirectiveScriptWrapper(){
        // Cookie creating scripts etc here....
    }
</script>
```

If you have cookie creating scripts in your page, move them into this function, which will 
prevent their execution until the user has agreed to receiving cookies (remove any 
surrounding `<script type="text/javascript">` & `</script>` html tags from the scripts).

Sometimes the script might need to run in a certain place on your site, or it might contain
the src attribute which links to a remote file. In these situations it is not sufficient to
move the scripts into the wrapper function. Instead, you'll need to use the `cdScriptAppend()`
function which can append the script to the `<head>` or `<body>` elements or, if you need it
to run in a particular place in your page, as a child of any html element, by passing the element's
id attribute. You specify the location using the second argument. 
Use 'head', 'body', or your own element's id.

For example, this page uses Google Analytics' asynchronous tracking script. 
Google recommend it is placed between the `<head>` and `</head>` tags.
I pasted the code Google provided to me in a file I named 'google.js' and saved that to
the root of this website. Then I used the cdScriptAppend function to load it before the
closing `</head>` tag in the page.

See the snippet below; 

```html
<script type="text/javascript">
    function cookiesDirectiveScriptWrapper(){
        // Cookie creating scripts etc here....
        cdScriptAppend('google.js', 'head');
    }
</script>
```

# Next, paste this html just before your closing `</body>` tag (i.e below the code added in Step 1 above); 
```html
<script type="text/javascript" src="http://js.cookiesdirective.com/1.5.js">
</script>
```

Finally, paste the below code before your closing `</body>` tag (i.e below the code added in Steps 1 and 2 above).
From version 1.3 the function `cookiesDirective()` accepts four arguments. The first (required) is the position
in your page you want to serve the disclosure; value can be 'top' or 'bottom'. 
The second (required) is the number of times you want to keep showing the disclosure if cookies are not 
being accepted. Enter a nunber of your choice. For example entering 5 will display the disclosure up to
5 times for each visitor. Entering 0 will display the disclosure on all page views. 
Please note this does not infer consent and start setting restricted cookies it just stops showing the banner.
The third argument (required) is the URI of your site's privacy policy where you can explain the Cookies
directive and how you handle cookies (and privacy) in more depth. The fourth is an optional string argument
which can contain a comma delimited list of third party scripts your site uses which will set cookies if the
user accepts them (i.e the scripts you moved to the wrapper function in Step 1). 

- Example 1 - no third party scripts to declare
```html
<script type="text/javascript">
    // The position of the disclosure ('top' or 'bottom')
    // Number of times to display disclosure. Enter 0 to show it forever!!!!
    // The URI of your privacy policy
    cookiesDirective('top',5,'privacy.html');
</script>
```

- Example 2 - third party scripts declared
```html
<script type="text/javascript">
    // The position of the disclosure ('top' or 'bottom')
    // Number of times to display disclosure. Enter 0 to show it forever!!!!
    // The URI of your privacy policy
    // A comma separated list of scripts which will create cookies
    cookiesDirective('bottom',0,'privacy.html','Google Analytics,My Stats');
</script>
```

What it does
================
 This script makes your site compliant in-so-far as it notifies your users that some cookies, presumably those of your CMS, Blog or Shopping Cart have already been created (we believe these qualify as "necessary"). It also communicates what "additional" cookies will be created if your user consents to receiving cookies, and points out that whilst cookies can be blocked by your users, access to your site may be limited as a result. Finally, it provides a link to your site's privacy policy.

Once consent is given no further disclosure is made on the site and your users can browse normally, even when they return to your website (that uses a cookie too). Until consent is given, the dialog will continue to be displayed, and cookie creating scripts placed in the wrapper function will not be running.

From version 1.3, the disclosure is removed after 10 seconds if consent has not being given. It is also possible to set the number of times the disclosure should be made if cookies are not being accepted which seemed like a good idea.

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