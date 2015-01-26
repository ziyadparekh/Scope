#!/bin/bash

BASEDIR=${1};

echo "cd BASEDIR ${1}";

cd ${1};

if docker ps -a | grep "ziyadsapp" ; then
	echo "attempting to build docker";
	docker build -t ziyadparekh/newapp .;
	echo "attempting to restart app"
	docker stop 'ziyadsapp';
	docker rm 'ziyadsapp';
	docker run -d -p 1060:1060 --name="ziyadsapp" 'ziyadparekh/newapp';
else
	#statements
	echo "attempting to build docker";
	docker build -t 'ziyadparekh/newapp' .;

	echo "attempting to run docker container";
	docker run -d -p 1060:1060 --name="ziyadsapp" 'ziyadparekh/newapp';
fi
