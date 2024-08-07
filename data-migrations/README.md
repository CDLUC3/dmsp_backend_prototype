# Data Migrations

This directory contains all of the necessary data migrations to build and alter a local instance of the application's database. We use a pattern similar to the one used by Rails.

The `process.sh` file should be used to modify your local DB. When you run it, it will:
- Detect any `*.sql` files in this directory
- Run those SQL scripts against your local DB (using the credentials defined in your `.env` file if run locally or SSM if run from the Cloud9 Bastion instance)
- Update the `dataMigrations` table with the name(s) of file that was processed.

The script checks the file names recorded in the `dataMigrations` table to determine whether or not it should run the migration. That means that you can delete the file name from this table and run the script if you need to rerun a migration for some reason.

Migration file names start with a date and timestamp to ensure that they are run in the correct order.

The `process-aws.sh` file is meant to be run from the AWS Clou9 instance only!

## Running from the local Docker container
Once you have the system running with `docker-compose up`, log into the container and run `bash ./data-migrations/process.sh`

## Running from the Cloud9 bastion server

### Cloud9 initialization
First clone the Apollo server repository so that we have access to the latest DB migrations:
- `git clone https://github.com/CDLUC3/dmsp_backend_prototype.git`

Checkout the version you want to work with (e.g. development)
- `cd ~/dmsp_backend_prototype/dmsp_backend_prototype`
- `git pull origin [branch]`
- `git checkout [branch]`

Then run the initialization script to install the necessary packages to be able to run MySQL commands
- `~/dmsp_backend_prototype/data-migrations/bastion-init.sh`

### Running the DB migrations
Make sure you are on the correct branch. Then run the following:
- `cd ~/dmsp_backend_prototype/data-migrations`
- `./process-aws.sh [ENV]`
