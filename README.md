
# Homebridge D-Link's DCH-S162 Wi-Fi enabled Water Detector

### STILL A WORK IN PROGRESS
Forked from mtflud/homebridge-dchs220-siren and to port over to the DCH-S160 water sensor.
Forked from (https://github.com/bman46/homebridge-DCH-S160) to DCH-162 water sensor.

# Adjusted documentation:

This plugin exposes the functionality of D-Link's DCH-S162 Water sensor a Switch.

## Install

 * ```sudo npm install -g homebridge-dlink-s162```
* Create an accessory in your config.json file
* Restart homebridge

## Example config.json:

 ```
    "accessories": [
        {
          "accessory": "S162",
          "name": "DLink Water Sensor",
          "ipAddress": "192.168.1.10",
          "pin": 123456,
          "updateInterval": 2000
        }
    ]

```



## Configuration Parameters
name: The name Homekit will give to your switch (you can change this later in Home app).

ipAddress: The IP Address of your Water sensor.

pin: 6 digit pin of your Siren, you can find it on the card included with it.

volume: Value from 1 to 100 determining the volume the siren should play at.

updateInterval: Time in milliseconds the program will poll for water sensor status.
