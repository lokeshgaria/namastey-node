const { body, param } = require('express-validator');

const sendRequestValidation = [
  param('status')
    .isIn(['interested', 'ignored'])
    .withMessage('Status must be interested or ignored'),
  
  param('toUserId')
    .isMongoId()
    .withMessage('Invalid user ID')
];

const reviewRequestValidation = [
  param('status')
    .isIn(['accepted', 'rejected'])
    .withMessage('Status must be accepted or rejected'),
  
  param('requestId')
    .isMongoId()
    .withMessage('Invalid request ID')
];

module.exports = {
  sendRequestValidation,
  reviewRequestValidation
};