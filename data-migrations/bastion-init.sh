echo 'Initializing Bastion to run MySQL data migrations'

sudo yum install -y vim curl
sudo yum groupinstall -y "Development Tools"
sudo yum install -y mariadb105-devel
