# Create an IOT dashboard with Intel Galileo 

![](http://i.imgur.com/4aerUHX.gif)

Have you ever wanted to create a dashboard for your car, home, server cluster, or anything else? Dashboards are becoming increasingly popular as begin to connect all sorts of different objects to the internet. That's why we created EON, a framework for creating realtime dashboards using charts and maps.

## Background

The demo we're about to cover inspired an entire framework. I first prototyped a potentiometer dashboard a few weeks ago, and that demo was converted into a plug and play library called EON. Now that EON is complete, we're revisting the idea that started it all. The potentiometer demo.

I originally tried to build this with Raspberry Pi, but discovered it doesn't have Analog inputs. While I wait on my Analog to Digital Converter, I dug through my supply and rediscovered the shiny Intel Galileo I got from participating in the [IOT contest on CodeProject](http://www.codeproject.com/Competitions/772/Internet-of-Things-Tutorial-Contest.aspx).

# Intel Galileo Gen 2

![](http://www.intorobotics.com/wp-content/uploads/2014/12/intel-galileo-gen-2.jpg)

The [Intel Galileo](http://www.intel.com/content/www/us/en/do-it-yourself/galileo-maker-quark-board.html) is really a fantastic product. Not only are you getting Intel quality hardware, packaging, and documentation, but it also comes with a custom IDE powered by Brackets. It was harder to setup than the Raspberry Pi and Arduino (Uno and Yun). 

However! Once you're setup you can not beat the Intel XDK IOT environment. 

![](https://software.intel.com/sites/default/files/managed/8e/2f/intelxdkiot_develop.png)

This thing is beefy, it's like Eclipse for Javascript and IOT. The IDE includes Error checking (jshint), deployment, NPM UI buttons, and a freakin devtools inspector! That's not even mentioning access to an Arduino inspired header layout, all accessable from NPM modules that come with every example.

There are some downsides however. For now, it's a little slow and buggy. I found it hard to rename projects, and if I left a Node process running it wouldn't terminate when I redeployed. Followers of this tutorial may encounter the same bugs.

Final verdict: I think we're seeing a glimpse of future of IOT development. 

![](http://media.giphy.com/media/KayVJ5lkB84rm/giphy.gif)

# Overview

* Intel Galileo Gen 2 - The beautiful blue chip that publishes potentiometer resistance to the internet.
* NodeJS - Running on the Galileo linux environment 
* PubNub - Realtime Data Stream Network that connects the Galileo to Eon-chart
* EON-chart - Realtime charting framework that connects to PubNub and renders the resistance value in HTML.

# Setup the Galileo

This tutorial assumes you own a Mac and a Galileo Gen 2. 

The very first step is to format an SD card (I stole mine from my Raspberry Pi starter kit) and update the firmware. Nothing worked for me until I did this.

[Follow this guide](http://rexstjohn.com/galileo-gen-2-setup/)

I also used a Thunderbolt Ethernet adapter to share my MacBook connection with my Galileo. I usually have an easier time setting my sharing to BootP when this is the case. If you have your Galileo plugged directly into a switch, ignore this.

![](http://i.imgur.com/cvKgdsN.png)

# Set up the XDK

![](http://i.imgur.com/L9rIytE.jpg)

Once you're all setup and get connected to your Galileo, you should see the following screen. Run a couple demo programs on the chip to get a feel for how the IDE works.

# Wire the Potentiometer

Wiring a Potentiometer is extremely easy. You feed 5v through one side, ground through the other, and the middle wire ouputs the resistance.

![](http://arduino.cc/en/uploads/Tutorial/potentiometer.jpg)

# Code walkthrough

Start with the Analog input example in the IOT XDK. 

In the package.json add PubNub as a dependency:

```js
{
  "name": "pubnub-galileo",
  "description": "",
  "version": "0.0.0",
  "main": "main.js",
  "engines": {
    "node": ">=0.10.0"
  },
  "dependencies": {
      "pubnub": "3.7.10"
  }
}
```

Then click Install/Build. This essentially runs ```npm install``` on your Galileo.

Now, you can modify the example to look like this or copy paste. 

The following example reads the value of analog pin ```0``` every ```500ms```, and publishes it to the PubNub network if it changes.

```js
var mraa = require('mraa');
var PUBNUB = require('pubnub');

console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console

var analogPin0 = new mraa.Aio(0); //setup access analog input Analog pin #0 (A0)

var pubnub = PUBNUB.init({
  publish_key: 'demo',
  subscribe_key: 'demo'
});

var lastValue = 0;
setInterval(function(){
    var analogValue = analogPin0.read(); //read the value of the analog pin

    var max = 1024;
    var percent = ((analogValue / max) * 100).toFixed(2);

    console.log(percent);

    if(percent !== lastValue) {

        pubnub.publish({
            channel: 'pubnub-intel-gal-demo',
            message: {
              columns: [
                ['Potentiometer', percent]
              ]
            }
        });

        lastValue = percent;
    }

}, 500);
```

This is the publishing part:

```js
pubnub.publish({
  channel: 'pubnub-intel-gal-demo',
  message: {
    columns: [
      ['Potentiometer', percent]
    ]
  }
 });
 ```
 
 The ```channel``` is the name of the room for which we'll subscribe to messages on the other end. The ```message``` is formatted like so because it matches the schema defined in eon-chart. More on that later.
 
 If everything is working you should see the value of the potentiometer output to [the PubNub console here](http://www.pubnub.com/console/?channel=pubnub-intel-gal-demo&origin=pubsub.pubnub.com&sub=demo&pub=demo&cipher=&ssl=false&secret=&auth=).
 
 If you need more help with PubNub, check out our Javascript SDK Examples.
 
 # The Dashboard

Now render the chart on an HTML webpage. We include the ```eon``` framework in the head of the page, and that'll take care of most of the work.

```html
  <script type="text/javascript" src="http://pubnub.github.io/eon/lib/eon.js"></script>
  <link type="text/css" rel="stylesheet" href="http://pubnub.github.io/eon/lib/eon.css" />
```
  
Now crate the chart with eon-chart. With this one function, we'll connect to the same PubNub channel the Galileo is broadcasting from (```pubnub-intel-gal-demo```), and render the data in a ```gauge``` type chart.

![](http://pubnub.github.io/eon/static/images/gauge.gif)

```html
<div id="chart"></div>
<script>
  var channel = "pubnub-intel-gal-demo";
  eon.chart({
    channel: channel,
    generate: {
      bindto: '#chart',
      data: {
        type: 'gauge',
      },
      gauge: {
        min: 0,
        max: 100
      },
      color: {
        pattern: ['#FF0000', '#F6C600', '#60B044'],
        threshold: {
          values: [30, 60, 90]
        }
      }
    }
  });
</script>
```

Load this page up in chrome and turn the potentiometer. 

![](http://i.imgur.com/4aerUHX.gif)

```html
<html>
  <head>
    <script type="text/javascript" src="http://pubnub.github.io/eon/lib/eon.js"></script>
    <link type="text/css" rel="stylesheet" href="http://pubnub.github.io/eon/lib/eon.css" />
  </head>
  <body>
    <div id="chart"></div>
    <script>
      var channel = "pubnub-intel-gal-demo";
      eon.chart({
        channel: channel,
        generate: {
          bindto: '#chart',
          data: {
            type: 'gauge',
          },
          gauge: {
            min: 0,
            max: 100
          },
          color: {
            pattern: ['#FF0000', '#F6C600', '#60B044'],
            threshold: {
              values: [30, 60, 90]
            }
          }
        }
      });
    </script>
  </body>
</html>
```

Keywords: Mac, thunderbolt, ethernet, galileo, iot, dashboard, realtime chart, potentiometer, gen 2 
