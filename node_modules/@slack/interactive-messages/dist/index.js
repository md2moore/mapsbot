'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.errorCodes = undefined;
exports.createMessageAdapter = createMessageAdapter;

var _expressMiddleware = require('./express-middleware');

var _adapter = require('./adapter');

var _adapter2 = _interopRequireDefault(_adapter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var errorCodes = exports.errorCodes = _expressMiddleware.errorCodes;

function createMessageAdapter(verificationToken, options) {
  return new _adapter2.default(verificationToken, options);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjcmVhdGVNZXNzYWdlQWRhcHRlciIsImVycm9yQ29kZXMiLCJ2ZXJpZmljYXRpb25Ub2tlbiIsIm9wdGlvbnMiXSwibWFwcGluZ3MiOiI7Ozs7OztRQUtnQkEsb0IsR0FBQUEsb0I7O0FBTGhCOztBQUNBOzs7Ozs7QUFFTyxJQUFNQywrREFBTjs7QUFFQSxTQUFTRCxvQkFBVCxDQUE4QkUsaUJBQTlCLEVBQWlEQyxPQUFqRCxFQUEwRDtBQUMvRCxTQUFPLHNCQUF3QkQsaUJBQXhCLEVBQTJDQyxPQUEzQyxDQUFQO0FBQ0QiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBlcnJvckNvZGVzIGFzIG1pZGRsZXdhcmVFcnJvckNvZGVzIH0gZnJvbSAnLi9leHByZXNzLW1pZGRsZXdhcmUnO1xuaW1wb3J0IFNsYWNrTWVzc2FnZUFkYXB0ZXIgZnJvbSAnLi9hZGFwdGVyJztcblxuZXhwb3J0IGNvbnN0IGVycm9yQ29kZXMgPSBtaWRkbGV3YXJlRXJyb3JDb2RlcztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2VBZGFwdGVyKHZlcmlmaWNhdGlvblRva2VuLCBvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgU2xhY2tNZXNzYWdlQWRhcHRlcih2ZXJpZmljYXRpb25Ub2tlbiwgb3B0aW9ucyk7XG59XG4iXX0=
//# sourceMappingURL=index.js.map