let SoapClient = require('./SoapClient');

class WaterDetector {

    constructor(ipAddress, password) {
        this.client = new SoapClient(ipAddress, password);
    }

    login() {
        return this.client.login().catch(err => {
            console.log(err);
        });
    }

    getWaterStatus() {
        return new Promise((resolve, reject) => {
            this.client._soapAction('GetWaterDetectorState', 'IsWater', this.client._requestBody('GetWaterDetectorState', `
                <ModuleID>1</ModuleID>
                <Controller>1</Controller>
            `)).then(IsWater => {
                let status = (IsWater == 'false' || IsWater == false) ? 0 : 1;
                return resolve(status);
            }).catch(err => {
                console.log(err);
                return reject(err);
            })
        });
    }
}

module.exports = WaterDetector;