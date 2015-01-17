#! /bin/bash
# script to create git repo for node subdomain 
# _rev is passed into the script as a parameter
mkdir apps
echo $1
mkdir apps/$1
cd apps/$1
git init --bare
cp ../../gitrepoclone.sh hooks/post-receive
chmod +x hooks/post-receive