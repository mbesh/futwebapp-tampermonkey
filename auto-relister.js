// ==UserScript==
// @name         auto-relister
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  automatically relist all transfers
// @author       mbesh
// @match        https://www.easports.com/fifa/ultimate-team/web-app/*
// @match        https://www.easports.com/*/fifa/ultimate-team/web-app/*
// @grant        none
// @require http://code.jquery.com/jquery-3.4.1.min.js
// @run-at  document-end
// ==/UserScript==


var button = document.createElement("Button");
var consoleLog = document.createElement("div");

function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
}

var selector = "body > main > section > section > div.ut-navigation-container-view--content > div > div > div > section:nth-child(2) > header > button";

var gotoLinkController = null;
var lastRelist = 0;

async function relister() {
    consoleLog.innerHTML = "Relisting ...<br/>" + consoleLog.innerHTML;
    while (button.started) {
        var relistButton = document.querySelector(selector);
        var waitTime = Math.trunc(45000 + (45000 * Math.random()));
        if(relistButton != null && relistButton.offsetParent != null) {
            consoleLog.innerHTML = `Found relist button - attempting to relist<br/>` + consoleLog.innerHTML;
            // pause for 2 seconds
            await timer(2000);
            //relist all
            if (lastRelist < 300000) {
                // we recently sent a relist so wait around 5 minutes
                var longSleep = Math.trunc(270000 + (60000 * Math.random()));
                consoleLog.innerHTML = `Last relist was sent ${lastRelist}ms ago. Waiting ${Math.trunc(longSleep/10.0/60.0)/100} minutes before sending relist<br/>` + consoleLog.innerHTML;
                await timer(300000);
            }
            UTItemService["prototype"]["relistExpiredAuctions"]();
            console.log(`Relist sent`);
            lastRelist = 0;
            // pause for 2 seconds
            await timer(2000);

            // Reload transfer list
            // first load the store
            gotoLinkController._gotoStore();
            await timer(5000 + (5000 * Math.random()));
            // reload transfer list
            gotoLinkController._gotoTransferList();
        } else {
            consoleLog.innerHTML = `Couldn't find relist button or it is not visible.<br/>` + consoleLog.innerHTML;
            // randomly go to store and back to keep session alive
            if (Math.random() * 100 > 90) {
                consoleLog.innerHTML = `Randomly loading store and going back.<br/>` + consoleLog.innerHTML;
                gotoLinkController._gotoStore();
                await timer(10000 + (35000 * Math.random()));
                // reload transfer list
                gotoLinkController._gotoTransferList();
            }
        }
        consoleLog.innerHTML = `Waiting ${waitTime}ms before checking again.<br/>` + consoleLog.innerHTML;
        if (consoleLog.innerHTML.length > 100000) {
            consoleLog.innerHTML = consoleLog.innerHTML.substring(0, 100000);
        }
        await timer(waitTime);
        lastRelist += waitTime;
    }
    consoleLog.innerHTML = "Stopped relisting process<br/>" + consoleLog.innerHTML;
}

function clickFn() {
    if (gotoLinkController == null) {
        // note this only works on the first page.
        gotoLinkController = _appMain.getRootViewController()._view._subviews[0].view._subviews[8].view._subviews[0].view._eventDelegates[0]._goToLinkController;
        gotoLinkController._gotoTransferList();
    }
    if (!button.started) {
        button.started = true;
        button.innerHTML = "Stop Auto-relister"
        relister();
    } else {
        button.innerHTML = "Start Auto-relister";
        button.started = false;
    }
}

function simulate(element, eventName){
    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    for (var name in eventMatchers) {
        if (eventMatchers[name].test(eventName)) {
            eventType = name;
            break;
        }
    }

    if (!eventType) {
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
    }

    if (document.createEvent) {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents') {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        }
        else
        {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                                  options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
                                  options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        console.log(`Dispatching event ${oEvent}`);
        element.dispatchEvent(oEvent);
    }
    else
    {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}

function extend(destination, source) {
    for (var property in source) {
        destination[property] = source[property];
    }
    return destination;
}

var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
};

var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
};

(function() {
    'use strict';
    console.log("Starting auto relist");
    $.noConflict( true );
    jQuery(document).ready(function() {
        button.innerHTML = "Start Auto-relister";
        button.style = "top:10px;right:250px;position:absolute;z-index: 9999;background-color:#ADD8E6";
        button.started = false;
        button.onclick = clickFn;
        document.body.appendChild(button);

        consoleLog.style = "color:#000;top:10px;left:155px;width:500px;height:100px;overflow:auto;max-height:100px;position:absolute;z-index: 9999;background-color:#fefeff;font-family:monospace;font-size:small";
        document.body.appendChild(consoleLog);
    });
})();
