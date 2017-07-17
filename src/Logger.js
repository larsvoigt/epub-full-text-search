import winston from 'winston';

winston.setLevels({
    debug:0,
    info: 1,
    silly:2,
    warn: 3,
    error:4,
});
winston.addColors({
    debug: 'green',
    info:  'cyan',
    silly: 'magenta',
    warn:  'yellow',
    error: 'red'
});

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    level: 'error',
    colorize:true,
    prettyPrint: true
});
// winston.add(winston.transports.File, {
//     level: 'error',
//     filename: 'epub-search.log',
//     maxsize: 5242880, //5MB
//     maxFiles: 5,
//     colorize: false,
//     prettyPrint: true
// });

module.exports = winston;