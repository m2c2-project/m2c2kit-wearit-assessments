# m2c2kit-wearit-assessments

## Introduction

This repository builds m2c2kit assessments so they can be used in the Wear-IT mobile platform (Android/iOS).

The assessments are published on NPM. The code in this repository brings in these assessments and bundles each into a separate folder that is ready to be used by Wear-IT.

## Building

First, install the prerequisites for building and testing the repository: [Node.js](https://nodejs.org) (version 18.x recommended) and [Git](https://git-scm.com/) are _required_. [Docker](https://www.docker.com/) is needed only for running integration tests, which is optional.

Second, clone the repository and execute the following from the repository root:

```
npm install
npm run build
```

This will create a `dist/assessments` folder with the assessments. Each assessment is in a separate folder, named after the assessment. The folder contains the JavaScript, HTML, assets, and other files needed by the assessment.

## Using within a native app

The `dist/assessments` folder should be bundled in the native app. Or, if you are going to dynamically update the assessments, place them on your server so the native app can download and save to the device's local storage.

The native app will need to know which assessment should be run, and then load the appropriate URL. For example, if the Wear-IT app determines that the symbol search assessment is to be run, the swift code (modified from https://github.com/m2c2-project/m2c2kit/tree/main/examples/ios-simple-webview) would be similar to:

```
let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "assessments/symbol-search")!
webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
```

To configure assessment-specific parameters, execute JavaScript to call the `SetParameters()` method. This must happen _after_ the assessment has initialized. Thus, call the JavaScript `SetParameters()` method only after receiving the `SessionInitialize` event. For example, let's set the number of trials to 1 and disable the quit button. The swift code would be similar to:

```
class ScriptMessageHandler: NSObject, WKScriptMessageHandler, ObservableObject {
    var webView: WKWebView
    init(webView: WKWebView) {
        self.webView = webView
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "iOSM2c2" {

            guard let dictionary = message.body as? [String : Any] else {
                assertionFailure("Received message from JavaScript with unexpected format.")
                return
            }
            let eventType = dictionary[EventKeys.type.rawValue] as? String

            print("Event: \(eventType!)")

            if (eventType == "SessionInitialize") {
                // After initialization is complete, you can modify the default parameters before starting the session.
                // For example, if we uncomment the below, we can change the number of trials for the first activity
                // to be only 1. See the source code for each assessment for its configurable parameters and defaults.
                self.webView.evaluateJavaScript("window.session.options.activities[0].setParameters({\"number_of_trials\": 1, \"show_quit_button\": false });", completionHandler: nil)
                self.webView.evaluateJavaScript("window.session.start();", completionHandler: nil)
            }

            if (eventType == "ActivityData") {
                // for ActivityData event, body will also contain trial data
                print(message.body)
            }
        }
    }
}
```

Explanation: the assessments built for Wear-IT are in sessions consisting of a single activity (an assessment is a kind of activity). Thus, `window.session.options.activities[0].setParameters( ... )` configures the one and only activity, which is at index 0.
