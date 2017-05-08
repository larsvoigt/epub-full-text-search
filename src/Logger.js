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
winston.add(winston.transports.Console, { level: 'debug', colorize:true });

module.exports = winston;