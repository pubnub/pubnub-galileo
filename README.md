# Create an IOT dashboard with Intel Galileo 

![](http://i.imgur.com/4aerUHX.gif)

Have you ever wanted to create a dashboard for your car, home, server cluster, or anything else? Dashboards are becoming increasingly popular as begin to connect all sorts of different objects to the internet. That's why we created EON, a framework for creating realtime dashboards using charts and maps.

## Background

The demo we're about to cover inspired an entire framework. I first prototyped a potentiometer dashboard a few weeks ago, and that demo was converted into a plug and play library called EON. Now that EON is complete, we're revisting the idea that started it all. The potentiometer demo.

I originally tried to build this with Raspberry Pi, but discovered it doesn't have Analog inputs. While I wait on my Analog to Digital Converter, I dug through my supply and rediscovered the shiny Intel Galileo I got from participating in the [IOT contest on CodeProject](http://www.codeproject.com/Competitions/772/Internet-of-Things-Tutorial-Contest.aspx).

# Intel Galileo Gen 2

![](http://www.intorobotics.com/wp-content/uploads/2014/12/intel-galileo-gen-2.jpg)

The [Intel Galileo](http://www.intel.com/content/www/us/en/do-it-yourself/galileo-maker-quark-board.html) is really a fantastic product. Not only are you getting Intel quality hardware, packaging, and documentation, but it also comes with a custom IDE powered by Brackets. It was harder to setup than the Raspberry Pi and Arduino (Uno and Yun). 

![](https://software.intel.com/sites/default/files/managed/8e/2f/intelxdkiot_develop.png)

This thing is beefy, it's like Eclipse for Javascript and IOT. The IDE includes Error checking (jshint), deployment, NPM UI buttons, and a freakin devtools inspector! That's not even mentioning access to an Arduino inspired header layout, all accessable from NPM modules that come with every example.

There are some downsides however. For now, it's a little slow and buggy. I found it hard to rename projects, and if I left a Node process running it wouldn't terminate when I redeployed. Followers of this tutorial may encounter the same bugs. I expect that with time the environment will become more stable.

I really think we're seeing a glimpse of future of IOT development. You can't beat coding NodeJS on microcontrollers, especially when it's this easy.

![](http://media.giphy.com/media/KayVJ5lkB84rm/giphy.gif)

# Overview

* [Intel Galileo Gen 2](http://www.intel.com/content/www/us/en/do-it-yourself/galileo-maker-quark-board.html) - The beautiful blue chip that publishes potentiometer resistance to the internet.
* [NodeJS](https://nodejs.org/) - Running on the Galileo linux environment 
* [PubNub](http://www.pubnub.com/) - Realtime Data Stream Network that connects the Galileo to Eon-chart
* [EON-chart](pubnub.com/developers/eon) - Realtime charting framework that connects to PubNub and renders the resistance value in HTML.

# Setup the Galileo

This tutorial assumes you own a Mac and a Galileo Gen 2. 

The very first step is to format an SD card (I stole mine from my Raspberry Pi starter kit) and update the firmware. I wasted a lot of time trying to get set up on old firmware. 

[Follow this guide for detailed instructions](http://rexstjohn.com/galileo-gen-2-setup/). After you complete the stepsin this guide you'll haev Node running on your Galileo and you'll be ready to get hacking.

It's also worth noting that I used a Thunderbolt Ethernet adapter to share my MacBook connection with my Galileo. I usually have an easier time setting my sharing to BootP when this is the case. If you have your Galileo plugged directly into a switch, ignore this.

![](http://i.imgur.com/cvKgdsN.png)

# Set up the XDK

![](http://i.imgur.com/L9rIytE.jpg)

Once you're all setup and get connected to your Galileo, you should see the following screen. Try running "Onboard LED BLink" and then the "Analog Read" templates to get a feel for how the Galileo works.

All we're gonna do is modify the Analog Read demo to publish the values of Pin 0 to the internet (over PubNub). PubNub has an easy to use package for this, but more on that later.

# Wire the Potentiometer

The Analog Read demo is pretty boring without any anlog input. Let's wire the potentiometer.

Potentiometers are simple. 5 volts goes into one pin and the ground goes out the other pin. When you turn the potentiometer, it increases or decreases resistance and that value is fed out the middle pin.

![](http://i.imgur.com/JZcPBDh.jpg)

The red wire is 5v, the black wire is ground, and the green wire is fed into analog input 0.

You can test your setup with a multimeter, or dive right into the code.

# Code walkthrough

Back to NodeJS. Start by loading the the Analog Read example in the IOT XDK. 

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

Then click Install/Build. This essentially runs ```npm install``` on your Galileo and adds the PubNub library to your build. PubNub is the backend for this demo; it allows us to publish the value of the potentiometer to the internet and read it somewhere else.

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
 
This means we're halfway there. The value is being read from the Galileo and published over PubNub to the internet. If you need more help with PubNub, check out our Javascript SDK Examples.

Now to render that value in a nice dashboard.
 
# The Dashboard

Now to create an HTML webpage to render the chart. We include the ```eon``` framework in the head of the page, and that'll take care of connecting to PubNub and creating our chart. Easy huh?

```html
  <script type="text/javascript" src="http://pubnub.github.io/eon/lib/eon.js"></script>
  <link type="text/css" rel="stylesheet" href="http://pubnub.github.io/eon/lib/eon.css" />
```
  
Create the chart with the following function. We supply the same PubNub channel the Galileo is broadcasting from (```pubnub-intel-gal-demo```) and render the data in a ```gauge``` type chart. EON-chart subscribes to that PubNub channel, renders the chart, and updates it when the value changes.

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

Try it out! Load this page up in chrome and turn the potentiometer. 

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

# Wohoo!

That's it! Now you're Galileo is broadcasting it's information over the internet (via PubNub) and into a webpage. You're probably loading the page locally, but it can be hosted anywhere and it'll still work all the same. 

![](http://i.imgur.com/4aerUHX.gif)

# Where to go from here

You can extend this demo by adding more charts (a spline chart for example), more analog inputs (more potentiometers, buttons, light sensors, etc), or even adding more microcontrollers. You can even use PubNub to allow one Galileo to talk to another Galileo, or command them all from a centralized control panel!

Keywords: Mac, thunderbolt, ethernet, galileo, iot, dashboard, realtime chart, potentiometer, gen 2 
