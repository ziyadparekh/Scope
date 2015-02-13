#!/bin/bash

BASEDIR=${1};
USERNAME=${2};
APPNAME=${3};
PORT=${4};

echo "cd BASEDIR ${1}";
echo "username ${2}";
echo "appname ${3}";
echo "port ${4}";

cd ${1};

if docker ps -a | grep "${3}" ;then
	echo "---> attempting to build ---> docker build -t ${2}/${3} .";
	docker build -t ${2}/${3} .;
	echo "attempting to restart app"
	docker stop ${3};
	docker rm ${3};
  echo "-----> attempting to run docker container";
	docker run -d -p ${4}:${4} --name=${3} ${2}/${3};
else
	#statements
	echo "----> attempting to build docker";
	docker build -t ${2}/${3} .;

	echo "-----> attempting to run docker container";
	docker run -d -p ${4}:${4} --name=${3} ${2}/${3};
fi

exit
