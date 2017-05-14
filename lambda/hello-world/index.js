exports.handler = (event, context, callback) => {
  callback(null, {
    Hello: 'World',
    This: 'is staging'
  });
};
