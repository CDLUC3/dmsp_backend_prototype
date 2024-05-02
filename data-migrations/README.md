# Data Migrations

This directory contains all of the necessary data migrations to build and alter a local instance of the application's database. We use a pattern similar to the one used by Rails.

The `process.sh` file should be used to modify your local DB. When you run it, it will:
- Detect any `*.sql` files in this directory
- Run those SQL scripts against your local DB (using the credentials defined in your `.env` file)
- Update the `processed.log` file with the name(s) of file that was processed.

The script checks the file names recorded in the `processed.log` file to determine whether or not it should run the migration. That means that you can delete the file name from this log file and run the script if you need to rerun a migration for some reason.

Migration file names start with a date and timestamp to ensure that they are run in the correct order.

The `process-aws.sh` file is meant for use within the AWS environment only!
