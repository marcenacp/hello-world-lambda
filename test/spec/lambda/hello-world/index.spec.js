const chai = require('chai');

const helloWorld = require('../../../../lambda/hello-world/index');

describe('handler', () => {
  it('should say "Hello from Lambda, people"', done => {
    process.env.PEOPLE = 'people';
    helloWorld.handler(null, null, (error, result) => {
      chai.expect(result).to.equal('Hello from Lambda, people');
      done();
    });
  });
});
