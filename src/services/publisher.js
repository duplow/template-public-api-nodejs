/*
app.locals.notify = (params) => {
  try {
    const { topic, correlationId, body } = params;

    var sender = broker.open_sender(topic);
    var message = {
      content_type: 'application/json',
      correlation_id: correlationId,
      body: body
    };

    sender.send(message);
  } catch (e) {
    bugsnag.notify(e);
    console.log(e);
  }
};
*/

const createPublisher = (broker) => {
  var senders = {};

  return {
    publish: (messageParams) => {
      if (!senders[messageParams.topic]) {
        senders[messageParams.topic] = broker.open_sender(messageParams.topic);
      }

      let sender = senders[messageParams.topic];

      return sender.send({
        content_type: 'application/json',
        correlation_id: messageParams.correlationId,
        body: messageParams.body
      });
    }
  };
};

module.exports = createPublisher;
