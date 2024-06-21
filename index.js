'use strict'

let Service, Characteristic;
let WaterDetector = require('./lib/WaterDetector');

module.exports = (homebridge) => {
    Service = homebridge.hap.Service
    Characteristic = homebridge.hap.Characteristic

    homebridge.registerAccessory('homebridge-DCH-S162', 'DCH-S162', WaterSensorAccessory)
}

class WaterSensorAccessory {
    constructor(log, config) {
        this.log = log
        this.config = config || {};

        // :: Config parameters
        this.name = this.config.name || 'D-Link Water Sensor';
        this.pin = this.config.pin || 123456;
        this.ipAddress = this.config.ipAddress || '127.0.0.1';
        this.detectorClient = new Siren(this.ipAddress, this.pin);
        this.updateInterval = (this.config.updateInterval && !isNaN(this.config.updateInterval) && this.config.updateInterval >= 100) ? this.config.updateInterval : false;

        //this.service = new Service.Switch(this.config.name);

        this.service = new this.Service(this.Service.LeakSensor);
    }

    getServices() {
        const informationService = new Service.AccessoryInformation()
            .setCharacteristic(Characteristic.Manufacturer, 'd-link')
            .setCharacteristic(Characteristic.Model, 'dch-S162')
            .setCharacteristic(Characteristic.SerialNumber, 'dlink-dch-S162')

        // :: Fault status (Home does not seem to support it, but Eve app does)
        this.service.addOptionalCharacteristic(Characteristic.StatusFault);

        // :: Status polling
        if (this.updateInterval) {
            setInterval(() => {
                this.getStatus().then(status => {
                    this.service.getCharacteristic(this.Characteristic.LeakDetected).setValue(status);
                }).catch(err => {
                    console.log(":: Error from status polling: " + err);
                });
            }, this.updateInterval);
        }

        return [informationService, this.service]
    }

    /*
     * Check to see if detector senses water:
     */
    getStatus() {
        return new Promise((resolve, reject) => {
            // :: Log In to the Water sensor
            this.detectorClient.login().then(status => {
                if (status !== 'success') {
                    this.log(":: An error occurred while logging in to the siren, please check the credentials in config.");
                    return reject("Error while logging in to the water sensor.");
                }
                // :: Retrieve playing status
                this.detectorClient.getWaterStatus().then(status => {
                    return resolve(status);
                }).catch(err => {
                    this.log(":: An error occurred while retrieving water sensor status: " + err);
                    return reject(err);
                });
            }).catch(err => {
                this.log(":: An error occurred while logging in to the water sensor: " + err);
                return reject(err);
            });
        });
    }

    getOnCharacteristicHandler(callback) {
        this.getStatus().then(status => {
            this.service.getCharacteristic(Characteristic.StatusFault)
                .updateValue(false);
            return callback(null, status);
        }).catch(err => {
            console.log(":: Error from status polling: " + err);
            this.service.getCharacteristic(Characteristic.StatusFault)
                .updateValue(true);
            return callback(false);
        });
    }

}
