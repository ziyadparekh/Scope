# Troubleshoot

Launch proxy.js to start services and it will launch app.js (node proxy.js)
- forever start proxy.js (launches proxy server redirecting port 4000 traffic to appropriate node app)
- forever start app.js (launches API on port 3000 for creating and managing node apps)

# Test

Subdomains can be tested by editing /etc/hosts like this:

- 127.0.0.1    localhost  a.localhost  b.localhost  c.localhost api.localhost
- save /etc/hosts and flush DNS like this: sudo dscacheutil -flushcache

- Access hello8124.js app on port 8124: http://a.localhost:4000
- Access hello8125.js app on port 8125: http://b.localhost:4000
- Access API http://api.localhost:4000/list/2.json
- Access all apps http://ziyad:123456@api.localhost:4000/status


### Register user:
- curl -X POST -d "username=testuser&password=123456" http://localhost:4000/register

- curl -X DELETE -u "ziyad:123456" http://api.localhost:4000/destroy
- curl -X DELETE -u "ziyad:123456" http://localhost:4000/destroy

### Create node app
- curl -X POST -u "testuser:123" -d "appname=test&start=hello.js" http://api.localhost:4000/apps
(requires basic auth and returns the port address required to use)

### Delete node app
- curl -X DELETE -u "testuser:123" -d "appname=test" http://api.localhost:4000/apps

# TODO

Need to figure out how to automatically configure the port to the listening port
