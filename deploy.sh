#!/usr/bin/env bash
set -e
project_name="emo-kids"
remote_path="/opt/${project_name}"
address=$1
if [ -z "$1" ]; then
  address="192.241.254.223"
fi

echo "===> Building bin/"
mkdir -p bin/
cp server.py bin/
cp nginx.conf bin/
cp emo-kids.conf bin/
cp -rf static bin/static
cp -rf templates bin/templates

echo "===> Deploying to ${address}:${remote_path}"
ssh root@$address /bin/bash << EOF
  mkdir -p ${remote_path}
EOF
rsync -aqz -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" --progress bin/ "root@${address}:${remote_path}"

echo "===> Updating Configuration Files"
ssh root@$address /bin/bash << EOF
  sudo cp -f "${remote_path}/nginx.conf" /etc/nginx/nginx.conf
  sudo service nginx restart

  sudo cp -f "${remote_path}/${project_name}.conf" "/etc/init/${project_name}.conf"
  sudo service $project_name restart
EOF

dones=(Profit "Party like its 1999" Done Swaggy Finished "High Five!!!")
echo "${dones[$RANDOM % ${#dones[@]}]}."
