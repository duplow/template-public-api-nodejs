const AWS = require('aws-sdk');

const createSns = () => {
  var sns = new AWS.SNS({ region: 'us-east-1' });

  /**
   * Build topic ARN
   * @params {String} topic name
   * @returns {String} topic ARN
   */
  sns.topicArn = function (topic) {
    var params = {
      region: 'us-east-1',
      accountId: process.env.AWS_ACCOUNT_ID
    };

    if (process.env.SNS_AWS_REGION) {
      params.region = process.env.SNS_AWS_REGION
    }

    if (process.env.SNS_AWS_ACCOUNT_ID) {
      params.accountId = process.env.SNS_AWS_ACCOUNT_ID
    }

    if (!params.accountId) {
      throw new TypeError('Missing AWS account ID');
    }

    return `arn:aws:sns:${params.region}:${params.accountId}:${topic}`;
  };

  /**
   * Publish json message
   * @param {Object} params
   * @param {String} params.topic
   * @param {Object} params.data
   * @returns {Promise}
   */
  sns.publishJson = function (params) {
    var publishParams = {
      TopicArn: null,
      Message: JSON.stringify(params.data)
    };

    if (params.topicArn) {
      publishParams.TopicArn = params.topicArn;
    }

    if (params.topic) {
      publishParams.TopicArn = sns.topicArn(params.topic);
    }

    /*
    if (params.subject) {
      publishParams.Subject = params.subject;
    }
    */

    return sns.publish(publishParams).promise();
  };

  return sns;
}

module.exports = createSns;
