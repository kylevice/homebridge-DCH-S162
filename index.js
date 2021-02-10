'use strict'

let Service, Characteristic;
let WaterDetector = require('./lib/WaterDetector');

module.exports = (homebridge) => {
    Service = homebridge.hap.Service
    Characteristic = homebridge.hap.Characteristic

    homebridge.registerAccessory('homebridge-DCH-S160', SirenSwitchAccessory)
}

class SirenSwitchAccessory {
    constructor(log, config) {
        this.log = log
        this.config = config || {};

        // :: Config parameters
        this.name = this.config.name || 'D-Link Water Detector';
        this.pin = this.config.pin || 123456;
        this.ipAddress = this.config.ipAddress || '127.0.0.1';
        this.detectorClient = new Siren(this.ipAddress, this.pin);
        this.updateInterval = (this.config.updateInterval && !isNaN(this.config.updateInterval) && this.config.updateInterval >= 100) ? this.config.updateInterval : false;

        //this.service = new Service.Switch(this.config.name);

        this.service = new this.Service(this.Service.ContactSensor);
    }

    getServices() {
        const informationService = new Service.AccessoryInformation()
            .setCharacteristic(Characteristic.Manufacturer, 'D-Link')
            .setCharacteristic(Characteristic.Model, 'DCH-S160')
            .setCharacteristic(Characteristic.SerialNumber, 'dlink-DCH-S160')

        this.service.getCharacteristic(Characteristic.On)
            .on('get', this.getOnCharacteristicHandler.bind(this))
            .on('set', this.setOnCharacteristicHandler.bind(this));

        // :: Fault status (Home does not seem to support it, but Eve app does)
        this.service.addOptionalCharacteristic(Characteristic.StatusFault);

        // :: Status polling
        if (this.updateInterval) {
            setInterval(() => {
                this.getStatus().then(status => {
                    this.service.getCharacteristic(Characteristic.On).setValue(status);
                }).catch(err => {
                    console.log(":: Error from status polling: " + err);
                });
            }, this.updateInterval);
        }

        return [informationService, this.service]
    }

    /*
     * Get the "playing" status of the siren
     */
    getStatus() {
        return new Promise((resolve, reject) => {
            // :: Log In to the Siren
            this.sirenClient.login().then(status => {
                if (status !== 'success') {
                    this.log(":: An error occurred while logging in to the siren, please check the credentials in config.");
                    return reject("Error while logging in to the siren.");
                }
                // :: Retrieve playing status
                this.sirenClient.getPlayingStatus().then(status => {
                    return resolve(status);
                }).catch(err => {
                    this.log(":: An error occurred while retrieving siren status: " + err);
                    return reject(err);
                });
            }).catch(err => {
                this.log(":: An error occurred while logging in to the siren: " + err);
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