echo 'Initializing Bastion to run MySQL data migrations'

sudo yum install -y vim curl
sudo yum groupinstall -y "Development Tools"
sudo yum install -y mariadb105-devel

echo "Now that this Bastion server has the necessary packages installed you will need to:"
echo "     - Initialize the database > ./data-migrations.sh/database-init.sh"
echo "     - Build the database tables > ./data-migrations.sh/process.sh"
