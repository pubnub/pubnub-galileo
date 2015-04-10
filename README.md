# Create a Potentiometer IOT Dashboard

![](http://i.imgur.com/4aerUHX.gif)

* PubNub + 
  * Creating IOT House
  * Got a free thing:
  * http://www.codeproject.com/Competitions/772/Internet-of-Things-Tutorial-Contest.aspx
* Intel Galileo Gen 2
  * Board overview 
* How it works
  * Intel Galileo
  * NodeJS
  * PubNub
  * EON-chart 
* Follow these instructions
  * http://rexstjohn.com/galileo-gen-2-setup/
  * Extra
   * Thunderbolt Ethernet adapter
   * Enable BootP
   * ![](http://i.imgur.com/cvKgdsN.png)
   * ![](http://i.imgur.com/L9rIytE.jpg)
* Code walkthrough


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
