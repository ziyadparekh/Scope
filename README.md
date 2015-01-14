Troubleshoot::
Launch proxy.js to start services and it will launch app.js (node proxy.js)
- forever start proxy.js (launches proxy server redirecting port 4000 traffic to appropriate node app)
- forever start app.js (launches API on port 3000 for creating and managing node apps)

Test::
Subdomains can be tested by editing /etc/hosts like this:
127.0.0.1    localhost  a.localhost  b.localhost  c.localhost
save /etc/hosts and flush DNS like this: sudo dscacheutil -flushcache

Access hello8124.js app on port 8124: http://a.localhost:4000
Access hello8125.js app on port 8125: http://b.localhost:4000
Access API http://api.localhost:4000/list/2.json
