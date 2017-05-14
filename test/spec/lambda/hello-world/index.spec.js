const chai = require('chai');

const helloWorld = require('../../../../lambda/hello-world/index');

describe('handler', () => {
  it('should return an "Hello World" object', done => {
    helloWorld.handler(null, null, (error, result) => {
      chai.expect(result).to.deep.equal({
        Hello: 'World',
        This: 'is staging'
      });
      done();
    });
  });
});
