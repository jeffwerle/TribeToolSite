# AppAvailability for iOS and Android

`Version 0.4.1`

A Plugin for Apache Cordova and Adobe PhoneGap by [ohh2ahh](http://ohh2ahh.com).

## 1. Description

This plugin allows you to check if an app is installed on the user's device.
It requires an URI Scheme (e.g. twitter://) on iOS or a Package Name (e.g com.twitter.android) on Android.

* Ready for the Command-line Interface of Cordova / PhoneGap 3.0 and later
* Works with PhoneGap Build ([more information](https://build.phonegap.com/plugins/17))

### Supported Platforms

* iOS
* Android

## 2. Installation

The Cordova CLI is the recommended way to install AppAvailability, see [The Command-line Interface](http://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface). You can find the plugin on these registries:
* [GitHub](https://github.com/ohh2ahh/AppAvailability)
* [npm](https://www.npmjs.com/package/cordova-plugin-appavailability)
* [Cordova Plugin Registry](http://plugins.cordova.io/#/package/com.ohh2ahh.plugins.appavailability) (deprecated [in favor of npm](http://cordova.apache.org/announcements/2015/04/21/plugins-release-and-move-to-npm.html))
* [PhoneGap Plugin Registry](https://build.phonegap.com/plugins/1054) (deprecated because updating a plugin on PhoneGap Build requires a paid plan now)

### Automatically (Command-line Interface)

Simply run this command to add the latest version of AppAvailability from [npm](https://www.npmjs.com/package/cordova-plugin-appavailability) to your project:
```
$ cordova plugin add cordova-plugin-appavailability
```

Don't forget to prepare and compile your project:
```
$ cordova build
```

You don't have to reference the JavaScript in your `index.html`.

Alternatively you can install AppAvailability from [GitHub](https://github.com/ohh2ahh/AppAvailability):
```
$ cordova plugin add https://github.com/ohh2ahh/AppAvailability.git
```

### PhoneGap Build

AppAvailability works with PhoneGap build too. **Unfortunately PhoneGap Build requires now a paid plan to update a plugin. Therefore the version on PhoneGap Build is deprecated.**

You can implement version `0.3.1` of the plugin by adding the following xml to your `config.xml`:
```xml
<gap:plugin name="com.ohh2ahh.plugins.appavailability" />
```
Or if you want to use the exact version of AppAvailability:
```xml
<gap:plugin name="com.ohh2ahh.plugins.appavailability" version="0.3.1" />
```

There is no need to reference the JavaScript in your `index.html`.

You can find a PhoneGap Build project which demonstrates AppAvailability in the repository [ohh2ahh/AppAvailability-Demo-PhoneGap-Build](https://github.com/ohh2ahh/AppAvailability-Demo-PhoneGap-Build).

## 3. Usage

:exclamation: The code changed in version 0.3.0 and supports now success and error callbacks! But you can still use the old approach, which is [described below](https://github.com/ohh2ahh/AppAvailability#old-approach-appavailability--030).

### iOS

```javascript
appAvailability.check(
    'twitter://', // URI Scheme
    function() {  // Success callback
        console.log('Twitter is available');
    },
    function() {  // Error callback
        console.log('Twitter is not available');
    }
);
```

### Android

```javascript
appAvailability.check(
    'com.twitter.android', // Package Name
    function() {           // Success callback
        console.log('Twitter is available');
    },
    function() {           // Error callback
        console.log('Twitter is not available');
    }
);
```

### Full Example

```javascript
var scheme;

// Don't forget to add the org.apache.cordova.device plugin!
if(device.platform === 'iOS') {
    scheme = 'twitter://';
}
else if(device.platform === 'Android') {
    scheme = 'com.twitter.android';
}

appAvailability.check(
    scheme,       // URI Scheme or Package Name
    function() {  // Success callback
        console.log(scheme + ' is available :)');
    },
    function() {  // Error callback
        console.log(scheme + ' is not available :(');
    }
);
```

### Old Approach (AppAvailability < 0.3.0)

The only thing you have to do is replacing `appAvailability.check` with `appAvailability.checkBool`:

```javascript
appAvailability.checkBool('twitter://', function(availability) {
    // availability is either true or false
    if(availability) { console.log('Twitter is available'); }
});
```

## 4. Some URI Schemes / Package Names

[How do I get the URI Scheme / Package Name?](https://github.com/ohh2ahh/AppAvailability/issues/2#issuecomment-22203591)

Twitter:
* iOS: `twitter://` ([more Schemes](http://wiki.akosma.com/IPhone_URL_Schemes#Twitter))
* Android: `com.twitter.android`

Facebook:
* iOS: `fb://` (and [many more](http://wiki.akosma.com/IPhone_URL_Schemes#Facebook) as `fb://profile`)
* Android: `com.facebook.katana`

WhatsApp:
* iOS: `whatsapp://` (only since v. 2.10.1, [more information](http://www.whatsapp.com/faq/en/iphone/23559013))
* Android: `com.whatsapp`

## 5. License

[The MIT License (MIT)](http://www.opensource.org/licenses/mit-license.html)

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