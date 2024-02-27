const moment = require('moment-timezone');

const systemTimeZone = moment.tz.guess();
console.log(systemTimeZone);
