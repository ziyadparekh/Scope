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

# BUGS
- Remove app image and container on delete app and delete user

# TODO
- Secure Mongodb
- Add git-enforce-directory script
- Refactor UserController
- Create Feed Controller
	- New apps
	- Updated apps
	- Trending apps
	- Categories ?
	- Most stars
- Create App star and unstar

FUTURE
- Create User follow and unfollow
- Create User feed
- Command line interface
- Front End interface


curl -X POST -d "username=ziyadparekh&password=123456&email=ziyad.parekh@gmail.com&rsaKey=ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDU7IVUg0nQar+AbF95qY98oLqbxpu6FpHzXMqWhgSEGx893vApzFZjyVHe8t9FuL64/RGifQplPtZl4ciSvlWV8b9NkUGNXw2NBRckVtUG3LqBZKpRKGMRbp2WjiY+gb5Px1NTPPzwy9Tjz9X6CiBcbaetPeuZIdiImh0bjedKOKrlOs815AExn0HyrFwNJKPhhkb5xhd9c5Jyslrf2DjFkomemZMb6q9Wnve/Bk8RWP9XvCybdIMq1AAmo3J4qghoZdSpkxUSmgwahJ5nPKdDfj1+//t3lk+ZOHhoghlAI3fJUNLtFvuz8p65QB0l5BIpB8R6m3eAP6kB+TppR4gb ziyad.parekh@gmail.com" http://localhost:3010/user


curl -X POST -u "ziyadparekh:123456" -d "appname=express&start=index.js" http://localhost:3010/apps

curl -X DELETE -u "ziyadparekh:123456" http://localhost:3010/user



Create db table for client
  secretKey
  publicKey

client hashes data with secret key and sends data, hash and public key over the wire
server finds the client based on public key, gets secret key and makes hash of req.body with secret key, compares the two
then resumes the process
