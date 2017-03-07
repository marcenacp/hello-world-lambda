exports.handler = (event, context, callback) => {
  const PEOPLE = process.env.PEOPLE || 'All';
  callback(null, `Hello from Lambda, ${PEOPLE}`);
};
