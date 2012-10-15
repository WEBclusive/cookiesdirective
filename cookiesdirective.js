/**
 * Cookies Directive Disclosure Script
 */
window.cookiesDirective = { scriptQueue: [] };

(function() {
    /**
     * private jQuery placeholder
     */
    var $ = null;
    var app = window.cookiesDirective;
    var options = {};

    /**
     * Constructor
     */
    app.init = function (overrideOptions) {
        if (typeof overrideOptions != 'undefined') {
            options = overrideOptions;
        }

        // parse some generic parameters
        options.defaultChecked  = options.defaultChecked || true;
        options.position = options.position || 'top';
        options.cssPosition = options.cssPosition || 'fixed';
        options.redirect = (options.redirect !== false);
        options.displayTimeout = options.displayTimeout || 9999;

        // Start Test/Loader (improved in v1.1)
        var jQueryVersion = '1.5';

        // Test for JQuery and load if not available
        if (window.jQuery === undefined || window.jQuery.fn.jquery < jQueryVersion) {
            var s = document.createElement("script");
            s.src = "http://ajax.googleapis.com/ajax/libs/jquery/" + jQueryVersion + "/jquery.min.js";
            s.type = "text/javascript";
            s.onload = s.onreadystatechange = function() {
                if ((!s.readyState || s.readyState == "loaded" || s.readyState == "complete")) {
                    // Safe to proceed
                    cookiesDirectiveMain();
                }
            }
            document.getElementsByTagName("head")[0].appendChild(s);
        } else {
            // We have JQuery and right version
            cookiesDirectiveMain();
        }
    }

    /**
     * Queues one anonymous function for execution
     * or a uri for inclusion
     * @param queueObj
     */
    app.queue = function (queueObj) {
        var queue = app.scriptQueue;

        if (typeof queueObj == 'function') {
            queue.push(queueObj);
        } else {
            if (!options.redirect) {
                console.log('Found script with src. This might not work the first time, without reloading the page.');
            }
            queue.push(function() {
                var script = document.createElement("script");
                script.src = queueObj;
                script.type = "text/javascript";
                $('body').append(script);
            });
        }
    }

    /**
     * Runs all blocked scripts without checking for approval
     * after the document is ready
     */
    var runScripts = function () {
        $(document).ready(function () {
            executeQueue();
        });
    }

    /**
     * Looks for queued scripts of type text/plain and queues them up
     */
    var queueInlineScripts = function () {
        $('.cookie-directive-queue').each(function(){
            var srcAttr = $(this).attr('src');
            if (srcAttr) {
                app.queue(srcAttr);
            } else {
                var jsCode = $(this).html();
                app.queue(function() {
                    var content = '<script type="text/javascript">' + jsCode + '</script>';
                    $('body').after(content);
                });
            }
        });
    }

    /**
     * Executes queued up scripts
     */
    var executeQueue = function () {
        var i;
        var queue = app.scriptQueue;

        while (queue.length > 0) {
            var callback = queue.shift();
            callback();
        }
    }

    /**
     * Adds a Modernizr for tracking being allowed
     */
    var trackingAllowed = function (trackingFlag) {
        if (typeof Modernizr == 'undefined' || typeof Modernizr.addTest == 'undefined') {
            return;
        }
        Modernizr.addTest('tracking-allowed', function() { return trackingFlag; });
    }

    /**
     * The main app logic
     * @return boolean whether scripts have been run
     */
    var cookiesDirectiveMain = function () {
        $ = jQuery;
        $(document).ready(function () {
            var disclosureCount;
            var displayTimes = options.repeatCount || 0;

            queueInlineScripts();

            if (cdReadCookie('cookiesDirective')) {
                // Cookies accepted run scripts
                runScripts();
                return trackingAllowed(true);
            }

            if (displayTimes > 0) {
                // We want to limit the number of times this is displayed
                // Record the view
                var cookieCount = cdReadCookie('cookiesDisclosureCount');

                if (! cookieCount) {
                    disclosureCount = 1;
                } else {
                    disclosureCount = cookieCount;
                    disclosureCount++;
                }

                cdCreateCookie('cookiesDisclosureCount', disclosureCount, 1);
                if (displayTimes >= disclosureCount) {
                    initBanner(options);
                }
            } else {
                // No limit display on all pages
                // Cookies not accepted make disclosure
                initBanner(options);
            }
            return trackingAllowed(false);
        });
    }

    /**
     * Formats a string explaining which apps are used
     * @param array of strings
     * @returns string
     */
    var getDefaultAppsDisclosureText = function () {
        var cookieScripts = options.thirdPartyApps || [];
        var scriptCount = cookieScripts.length;
        var appsDisclosure = '';
        if (scriptCount > 1) {
            var epdAppsDisclosureText = '';
            for ( var t = 0; t < scriptCount - 1; t++) {
                epdAppsDisclosureText += cookieScripts[t] + ', ';
            }
            appsDisclosure = 'We also use ' + epdAppsDisclosureText.substring(0, epdAppsDisclosureText.length - 2) + ' and '
                    + cookieScripts[scriptCount - 1] + ' scripts, which all use cookies. ';
        } else if (scriptCount > 0) {
            appsDisclosure = 'We also use a ' + cookieScripts[0] + ' script which uses cookies.';
        }
        return appsDisclosure;
    }

    /**
     * Returns the default text to print before the checkbox
     * @return string
     */
    var getDefaultDisclosureHtml = function () {
        var html = 'This site uses cookies. ';
        html += 'Some of the cookies we use are essential for parts of the site to operate and have already been set. ';
        html += getDefaultAppsDisclosureText();
        html += 'You may delete and block all cookies from this site, but parts of the site will not work. ';
        if (options.policyUri) {
            html += 'To find out more about cookies on this website, see our ';
            html += '<a style="color:#ca0000;font-weight:bold;font-family:arial;font-size:14px;" href="';
            html += options.policyUri + '">privacy policy</a>.';
        }
        html += '<br/>';
        return html;
    }

    /**
     * Handles showing/hiding the banner and related events
     */
    var initBanner = function () {
        var buttonLabel = options.buttonLabel || 'Continue';
        var checkboxLabel = options.checkboxLabel || 'I accept cookies from this site';
        var agreementPromptText = options.agreementText || 'You must tick the "I accept cookies from this site" box to accept';
        var disclosureHtml = options.disclosureHtml || getDefaultDisclosureHtml();

        // Create our overlay with message
        var divNode = document.createElement('div');
        divNode.setAttribute('id', 'epd');
        document.body.appendChild(divNode);

        // The disclosure narrative pretty much follows that on the Information  Commissioners Office website
        var disclosure = '<div id="cookiesdirective" style="position:' + options.cssPosition + ';' + options.position;
        disclosure += ':-300px;left:0px;padding:5px;width:100%;height:auto;background:#000000;opacity:.90; -ms-filter: alpha(opacity=90); ';
        disclosure += 'filter: alpha(opacity=90);-khtml-opacity: .90; -moz-opacity: .90; color:#FFFFFF;font-family:arial;font-size:14px;';
        disclosure += 'text-align:center;z-index:1000;">';
        disclosure += '<div style="position:relative;height:auto;width:90%;margin-left:auto;margin-right:auto;">';
        disclosure += disclosureHtml;
        disclosure += '<div id="epdnotick" style="color:#ca0000;display:none;margin:2px;"><span style="background:#cecece;padding:2px;">';
        disclosure += agreementPromptText;
        disclosure += '</span></div>';
        disclosure += '<label for="epdagree" style="color:#fff">' + checkboxLabel + '</label>';
        disclosure += ' <input type="checkbox" name="epdagree" id="epdagree" ' + (options.defaultChecked ? 'checked="checked' : '');
        disclosure += ' style="padding:0; margin:0"/>&nbsp;';
        disclosure += '<input type="submit" name="epdsubmit" id="epdsubmit" value="' + buttonLabel + '" style="margin:0;padding:0" /></div></div>';
        document.getElementById("epd").innerHTML = disclosure;

        showBanner();
    }

    /**
     * Shows the banner
     */
    var showBanner = function () {
        $('#cookiesdirective').animate(
            (options.position == 'bottom') ? { bottom: '0' } : { top: '0'},
            1000,
            function() {
                // Overlay is displayed, set a listener on the button
                $('#epdsubmit').click(function() {
                    if (document.getElementById('epdagree').checked) {
                        // Set a cookie to prevent this being displayed again
                        cdCreateCookie('cookiesDirective', 1, 365);
                        // Close the overlay
                        closeBanner();
                    } else {
                        // We need the box checked we want "explicit consent",
                        // display message
                        document.getElementById('epdnotick').style.display = 'block';
                    }
                });

                // Set a timer to remove the warning after options.displayTimeout seconds
                setTimeout(hideBanner, options.displayTimeout * 1000);
            }
        );
    }

    /**
     * Hides the banner with a slide animation (after timeout)
     */
    var hideBanner = function () {
        $('#cookiesdirective').animate(
            { opacity : '0' },
            2000,
            function() {
                $('#cookiesdirective').remove();
            }
        );
    }

    /**
     * Closes the banner destroying it (after accepting cookies)
     */
    var closeBanner = function () {
        $('#cookiesdirective').animate(
            (options.position == 'bottom') ? { bottom: '-300' } : { top: '-300' },
            1000,
            function() {
                // Remove the elements from the DOM and reload page,
                // which should now fire our the scripts enclosed by our wrapper function
                $('#cookiesdirective').remove();
                if (options.redirect) {
                    location.reload(true);
                } else {
                    runScripts();
                }
            }
        );
    }

    /**
     * Read cookie with given name
     * @return string
     */
    var cdReadCookie = function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for ( var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
                c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0)
                return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    /**
     * Sets the cookie
     * @param name The name of the cookie
     * @param value The value of the cookie
     * @param days The days after which the cookie will expire
     */
    var cdCreateCookie = function (name, value, days) {
        var expires = '';
        var domainString = options.domain ? '; domain=' + options.domain : '';

        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        }

        var cookie = name + "=" + value + expires + domainString + "; path=/";
        document.cookie = cookie;
    }
})();