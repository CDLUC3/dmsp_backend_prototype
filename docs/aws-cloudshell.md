# AWS Cloushell

The following recipes can be used within the AWS console to startup a Cloudshell session and interact with the resources available to the ECS services but that cannot be accessed from your local machine or the AWS console.

## MySQL database

1. Log into the AWS console
2. Click the cloudshell icon
3. Click to add a new tab in Cloudshell and:
  - select the VPC
  - select a Subnet
  - select the `dmp-tool-[env]-rds-SecGrp` security group
4. Run the following commands to start a mysql session:
  - `HOST=$(aws ssm get-parameter --name /uc3/dmp/tool/dev/RdsHost | jq -r .Parameter.Value)`
  - `DB=$(aws ssm get-parameter --name /uc3/dmp/tool/dev/RdsName | jq -r .Parameter.Value)`
  - `USER=$(aws ssm get-parameter --name /uc3/dmp/tool/dev/RdsUsername | jq -r .Parameter.Value)`
  - `PWD=$(aws ssm get-parameter --name /uc3/dmp/tool/dev/RdsPassword | jq -r .Parameter.Value)`
  - `mysql -v -h $HOST -u $USER -p $PASSWORD $DB`
5. The run whatever queries you need.

## General

You can also run any AWS CLI commands from the cloudshell env.


