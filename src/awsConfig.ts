import AWS from 'aws-sdk';

// JS SDK v3 does not support global configuration.
// Codemod has attempted to pass values to each service client in this file.
// You may need to update clients outside of this file, if they use global config.
AWS.config.update({
  region: process.env.AWS_REGION,
  // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export default AWS;
