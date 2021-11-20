
const UserException = function (errorCode, detail = {}) {
  this.name = 'UserException';
  this.code = errorCode;
  this.detail = detail;

  let message = `UserException(${errorCode}):`;
  message += "\n";
  message += JSON.stringify(detail, null, 2);

  this.message = message;
  
  this.toString = () => {
    return message;
  }
};

UserException.prototype = new Error();
UserException.prototype.name = 'UserException';

module.exports = UserException;