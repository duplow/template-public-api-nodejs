
const PermissionError = function (permission, detail = {}) {
  this.name = 'PermissionError';
  this.permission = permission;
  this.detail = detail;

  let message = `Permission "${permissionKey}" id required to perform this action.`;

  this.message = message;
  this.toString = () => {
    return message;
  }
};

PermissionError.prototype = new Error();
PermissionError.prototype.name = 'PermissionError';

module.exports = PermissionError;