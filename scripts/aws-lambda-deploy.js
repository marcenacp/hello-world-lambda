const exec = require('child_process').exec;
const read = require('fs').readFileSync;
const AWS = require('aws-sdk');
const Promise = require('bluebird');

const lambdaName = process.argv[2];
if (!lambdaName) {
  console.error('Error: missing lambda name.');
  process.exit(1);
}

const lambdaAlias = process.argv[3];
if (!lambdaAlias) {
  console.error('Error: missing lambda alias.');
  process.exit(1);
}

const lambda = new AWS.Lambda({
  region: 'eu-west-1'
});

const lambdaUpdateFunctionCode = Promise.promisify(lambda.updateFunctionCode.bind(lambda));
const lambdaUpdateAlias = Promise.promisify(lambda.updateAlias.bind(lambda));
const lambdaAddPermission = Promise.promisify(lambda.addPermission.bind(lambda));
const execCommand = Promise.promisify(exec);

const cwd = process.cwd();
const zipLambdaCommand = `
  cd ${cwd}/lambda/${lambdaName}/ &&
  npm install --production &&
  zip -r ${lambdaName}.zip * --quiet`;

execCommand(zipLambdaCommand)
.then(() => {
  const lambdaUpdateFunctionCodeParams = {
    FunctionName: `${lambdaName}`,
    Publish: true,
    ZipFile: read(`${cwd}/lambda/${lambdaName}/${lambdaName}.zip`)
  };
  console.log('Uploading code to lambda with params:', lambdaUpdateFunctionCodeParams);
  return lambdaUpdateFunctionCode(lambdaUpdateFunctionCodeParams);
})
.then(lambdaData => {
  const lambdaVersion = lambdaData.Version;
  console.log('Lambda code uploaded with version', lambdaVersion);
  const lambdaUpdateAliasParams = {
    FunctionName: `${lambdaName}`,
    Name: lambdaAlias,
    FunctionVersion: lambdaVersion
  };
  console.log(`Updating alias ${lambdaAlias} for lambda ${lambdaName}`);
  return lambdaUpdateAlias(lambdaUpdateAliasParams);
})
.then(lambdaAliasData => {
  console.log('Lambda alias deployed with data', lambdaAliasData);
  const lambdaAddPermissionParams = {
    Action: 'lambda:InvokeFunction',
    FunctionName: `${lambdaName}:${lambdaAlias}`,
    Principal: 'apigateway.amazonaws.com',
    StatementId: `ID-${lambdaAlias}-${new Date().getTime()}`
  };
  console.log(`Setting permission for lambda ${lambdaName} with alias ${lambdaAlias}`);
  return lambdaAddPermission(lambdaAddPermissionParams);
})
.then(() => {
  console.log('Permission setted');
  console.log('Deployment done');
  return;
})
.catch(error => {
  throw new Error(`Error while executing deployment script: ${error}`);
});
