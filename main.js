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