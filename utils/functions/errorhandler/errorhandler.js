const { log, debug_log } = require("../../../logs");
const callerId = require('caller-id');

module.exports.errorhandler = ({err = 'No error passed! ', message = 'No message passed! ', fatal = true}) => {
    const caller = callerId.getData();

    let errObj = {
        'Error:': err.toString(),
        'Message': message,
        'Called From': caller.filePath,
        'Line': caller.lineNumber
    }

    if(process.env.ENV === 'dev') console.log(err, message, caller.filePath + ' ' + caller.lineNumber);

    else if(fatal && log) log.fatal(errObj);

    else if(!fatal) debug_log.info(errObj);
    
    return;
}