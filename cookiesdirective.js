/**
 * Cookies Directive Disclosure Script
 * 
 * Accepts an option object with all params optional.
 * Valid params are:
 * 
 * @param repeatCount The number of times to display the banner before giving up
 * @param policyUri The uri to point to for reading the policy. if not set no link will be printed
 * @param thirdPartyApps Array of strings with the 3rd party apps that use cookies (for use by default texts)
 * @param position Where to place the banner (top or bottom)
 * @param displayTimeout The number of seconds to display the banner each time
 * @param cssPosition Either 'fixed' or 'absolute'
 * @param disclosureHtml Overrides the default text (apart from the checkbox and button) 
 * @param buttonLabel The text of the submit button
 * @param checkboxLabel The text next to the checkbox
 * @param agreementText The text reminding the user to tick the checkbox
 * @param domain The domain to set the cookie to
 * @param redirect Whether to redirect after accepting cookies or attempt to run js directly
 */

window.cookiesDirective = {};

(function() {
    var app = window.cookiesDirective;

    /**
     * Constructor
     */
    app.init = function (options)
    {
        if (typeof options == 'undefined') {
            options = {};
        }
        this.options = options;

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
                    cookiesDirectiveMain(options);
                }
            }
            document.getElementsByTagName("head")[0].appendChild(s);
        } else {
            // We have JQuery and right version
            cookiesDirectiveMain(options);
        }
    }

    /**
     * Appends a script in the html head.
     * @param scriptUri
     * @param myLocation
     */
    app.appendScript = function (scriptUri, myLocation) {
        // Reworked in Version 1.1 - needed a more robust loader
        var elementId = String(myLocation);
        var sA = document.createElement("script");
        sA.src = scriptUri;
        sA.type = "text/javascript";
        sA.onload = sA.onreadystatechange = function() {
            if ((!sA.readyState || sA.readyState == "loaded" || sA.readyState == "complete")) {
                return;
            }
        }
        switch (myLocation) {
            case 'head':
                document.getElementsByTagName('head')[0].appendChild(sA);
                break;
            case 'body':
                document.getElementsByTagName('body')[0].appendChild(sA);
                break;
            default:
                document.getElementById(elementId).appendChild(sA);
                break;
        }
    }

    /**
     * The main app logic
     * @param options
     */
    var cookiesDirectiveMain = function (options) {
        var disclosureCount;
        var displayTimes = options.repeatCount || 0;
        var cookieDomain = options.domain || null;

        if (!cdReadCookie('cookiesDirective')) {
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

                cdCreateCookie('cookiesDisclosureCount', disclosureCount, 1, cookieDomain);
                if (displayTimes >= disclosureCount) {
                    cdHandler(options);
                }
            } else {
                // No limit display on all pages
                // Cookies not accepted make disclosure
                cdHandler(options);
            }
        } else {
            // Cookies accepted run script wrapper
            cookiesDirectiveScriptWrapper();
        }
    }

    /**
     * Returns true if the browser can't support fixed positioning
     * Private
     * @returns {Boolean}
     */
    var detectIE789 = function () {
        // Detect IE less than version 9.0
        var version;
        if (navigator.appName != 'Microsoft Internet Explorer') {
            return false;
        }
        var userAgent = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(userAgent) != null) {
            version = parseFloat(RegExp.$1);
        }

        if (version <= 8.0) {
            return true;
        }
        if (version != 9.0) {
            return false;
        }
        if (document.compatMode != "BackCompat") {
            return false;
        }
        // IE9 in quirks mode won't run the script properly, set to
        // emulate IE8
        var mA = document.createElement("meta");
        mA.content = "IE=EmulateIE8";
        document.getElementsByTagName('head')[0].appendChild(mA);
        return true;
    }

    /**
     * Formats a string explaining which apps are used
     * Private
     * @param array of strings
     * @returns string
     */
    var getDefaultAppsDisclosureText = function (cookieScripts) {
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
     * Handles showing/hiding the banner and related events
     * Private
     * @param options
     */
    var cdHandler = function (options) {
        var cookieDomain = options.domain || null;
        var privacyPolicyUri = options.policyUri || null;
        var cookieScripts = options.thirdPartyApps || [];
        var disclosurePosition = options.position || 'top';
        // The number of seconds to display the banner
        var displaySeconds = options.displayTimeout || 9999;
        var cssPosition = options.cssPosition || 'fixed';
        var buttonLabel = options.buttonLabel || 'Continue';
        var checkboxLabel = options.checkboxLabel || 'I accept cookies from this site';
        var agreementPromptText = options.agreementText || 'You must tick the "I accept cookies from this site" box to accept';
        var redirectFlag = true; 
        var animationSettingsShow;
        var animationSettingsHide;
        var disclosureHtml;

        if (typeof options.redirect !== 'undefined') {
            redirectFlag = options.redirect;
        }

        var defaultDisclosureHtml = 'On 26 May 2011, the rules about cookies on websites changed. This site uses cookies. ';
        defaultDisclosureHtml += 'Some of the cookies we use are essential for parts of the site to operate and have already been set. ';
        defaultDisclosureHtml += getDefaultAppsDisclosureText(cookieScripts);
        defaultDisclosureHtml += 'You may delete and block all cookies from this site, but parts of the site will not work. ';
        if (privacyPolicyUri !== null) {
            defaultDisclosureHtml += 'To find out more about cookies on this website, see our ';
            defaultDisclosureHtml += '<a style="color:#ca0000;font-weight:bold;font-family:arial;font-size:14px;" href="';
            defaultDisclosureHtml += privacyPolicyUri + '">privacy policy</a>.';
        }
        defaultDisclosureHtml += '<br/>';

        disclosureHtml = options.disclosureHtml || defaultDisclosureHtml;

        disclosurePosition = disclosurePosition.toLowerCase();

        if (detectIE789()) {
            // In IE 8 & presumably lower, position:fixed does not work
            // IE 9 in compatibility mode also means script won't work
            // Means we need to force to top of viewport and set position absolute
            disclosurePosition = 'top';
            cssPosition = 'absolute';
        }

        // Create our overlay with message
        var divNode = document.createElement('div');
        divNode.setAttribute('id', 'epd');
        document.body.appendChild(divNode);

        // The disclosure narrative pretty much follows that on the Information  Commissioners Office website
        var disclosure = '<div id="cookiesdirective" style="position:' + cssPosition + ';' + disclosurePosition;
        disclosure += ':-300px;left:0px;padding:5px;width:100%;height:auto;background:#000000;opacity:.90; -ms-filter: alpha(opacity=90); ';
        disclosure += 'filter: alpha(opacity=90);-khtml-opacity: .90; -moz-opacity: .90; color:#FFFFFF;font-family:arial;font-size:14px;';
        disclosure += 'text-align:center;z-index:1000;">';
        disclosure += '<div style="position:relative;height:auto;width:90%;margin-left:auto;margin-right:auto;">';
        disclosure += disclosureHtml;
        disclosure += '<div id="epdnotick" style="color:#ca0000;display:none;margin:2px;"><span style="background:#cecece;padding:2px;">';
        disclosure += agreementPromptText;
        disclosure += '</span></div>';
        disclosure += '<label for="epdagree">' + checkboxLabel + '</label>';
        disclosure += ' <input type="checkbox" name="epdagree" id="epdagree" style="padding:0; margin:0"/>&nbsp;';
        disclosure += '<input type="submit" name="epdsubmit" id="epdsubmit" value="' + buttonLabel + '" style="margin:0;padding:0" /></div></div>';
        document.getElementById("epd").innerHTML = disclosure;

        switch (disclosurePosition) {
            case 'bottom':
                animationSettingsShow = { bottom: '0' };
                animationSettingsHide = { bottom: '-300' }; 
                break;
            case 'top':
            default:
                animationSettingsShow = { top: '0' };
                animationSettingsHide = { top: '-300' }; 
                break;
        }

        $('#cookiesdirective').animate(
            animationSettingsShow,
            1000,
            function() {
                // Overlay is displayed, set a listener on the button
                $('#epdsubmit').click(function() {
                    if (document.getElementById('epdagree').checked) {
                        // Set a cookie to prevent this being displayed again
                        cdCreateCookie('cookiesDirective', 1, 365, cookieDomain);
                        // Close the overlay
                        $('#cookiesdirective').animate(
                            animationSettingsHide,
                            1000,
                            function() {
                                // Remove the elements from the DOM and reload page,
                                // which should now fire our the scripts enclosed by our wrapper function
                                $('#cookiesdirective').remove();
                                if (redirectFlag) {
                                    location.reload(true);
                                } else {
                                    cookiesDirectiveScriptWrapper();
                                }
                            }
                        );
                    } else {
                        // We need the box checked we want "explicit consent",
                        // display message
                        document.getElementById('epdnotick').style.display = 'block';
                    }
                });

                // Set a timer to remove the warning after 10 seconds
                setTimeout(function() {
                    $('#cookiesdirective').animate(
                        { opacity : '0' },
                        2000,
                        function() {
                            $('#cookiesdirective').css(animationSettingsHide);
                        }
                    );
                }, displaySeconds * 1000);
            }
        );
    }

    /**
     * Read cookie with given name
     * Private
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
     * Private
     * @param name The name of the cookie
     * @param value The value of the cookie
     * @param days The days after which the cookie will expire
     * @param domain The domain to set the cookie to
     */
    var cdCreateCookie = function (name, value, days, domain) {
        var domainString = '';
        var expires = '';

        if (typeof domain !== 'undefined') {
            domainString = '; domain=' + domain;
        }

        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        }

        var cookie = name + "=" + value + expires + domainString + "; path=/";
        document.cookie = cookie;
    }
})();