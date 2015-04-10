# Create a Potentiometer IOT Dashboard

![](http://i.imgur.com/4aerUHX.gif)

I've had this idea for a demo for a while. This is actually the second version. The idea spawned the EON framework, and the demo was converted into a full fledged library before being released.

Now that EON is complete, we're revisting the idea that started it all. The potentiometer demo.

I originally tried to build this with Raspberry Pi, but discovered it doesn't have Analog inputs. While I wait on my Analog to Digital Converter, I dug through my supply and rediscovered the shiny Intel Galileo I got from participating in the IOT contest on CodeProject.

My entry in that contest was a super cool remote controlled model house.

# Intel Galileo Gen 2

![](http://www.intorobotics.com/wp-content/uploads/2014/12/intel-galileo-gen-2.jpg)

The Intel Galileo is really a fantastic product. Not only are you getting Intel quality hardware, packaging, and documentation, but it also comes with a custom IDE powered by Brackets. It was harder to setup than the Raspberry Pi and Arduino (Uno and Yun). 

However! Once you're setup you can not beat the Intel XDK IOT environment. 

![](https://software.intel.com/sites/default/files/managed/8e/2f/intelxdkiot_develop.png)

This thing is beefy, it's like Eclipse for Javascript and IOT. The IDE includes Error checking (jshint), deployment, NPM UI buttons, and a freakin devtools inspector! That's not even mentioning access to an Arduino inspired header layout, all accessable from NPM modules that come with every example.

There are some downsides however. For now, it's a little slow and buggy. I found it hard to rename projects, and if I left a Node process running it wouldn't terminate when I redeployed. Followers of this tutorial may encounter the same bugs.

Final verdict: I think we're seeing a glimpse of future of IOT development. 

![](http://media.giphy.com/media/KayVJ5lkB84rm/giphy.gif)

# How it works

* Intel Galileo
  *
* NodeJS
* PubNub
* EON-chart

# Follow these instructions

* http://rexstjohn.com/galileo-gen-2-setup/
* Extra
 * Thunderbolt Ethernet adapter
 * Enable BootP
 * ![](http://i.imgur.com/cvKgdsN.png)
 * ![](http://i.imgur.com/L9rIytE.jpg)

# Code walkthrough


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

![](http://i.imgur.com/vtKPWmG.gif)

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
