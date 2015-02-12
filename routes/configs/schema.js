'use strict';

var baseUrl = 'http://localhost:3010';

var topnav = {
	title : 'Welcome',
  login : true,
	navMenu : [
		{
			title: 'Explore',
			link: baseUrl + '/explore'
		},
		{
			title: 'About',
			link: baseUrl + '/about'
		},
		{
			title: 'How To',
			link: baseUrl + '/how-to'
		}
	]
};

module.exports = {
	topnav : topnav
};
