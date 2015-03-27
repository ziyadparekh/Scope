'use strict';

var Templates = require("@templates/ProfileWrapperTemplate");
var ProfileMenuView = require('views/profile/ProfileMenuView');
var ProfileImageView = require('views/profile/ProfileImageView');
var ProfileNameView = require('views/UITextView');
var UIBaseAppInfoView = require("views/UIBaseAppInfoView");
var ProfileCollectionView = require("views/profile/ProfileCollectionView");

module.exports = {
    template: Templates['profile-wrapper-view'],
    subViewConfig: {
        profileImage: {
            construct: ProfileImageView,
            location: "#profile-image",
            singleton: true,
            options: {
                template: Templates['profile-image-view'],
                src: "https://avatars2.githubusercontent.com/u/4661481?v=3&s=460",
                imageClass: "ui small rounded image"
            }
        },
        profileName: {
            construct: ProfileNameView,
            location: "#profile-user",
            singleton: true,
            template: Templates['profile-name-view'],
            options: {
                nameClass: "",
                tagName: "h1",
                vars: {
                    name: function () {
                        return this.model.get("user_name");
                    }
                }
            }
        },
        profileMenu: {
            construct: ProfileMenuView,
            location: "#profile-menu",
            singleton: true,
            options: {
                template: Templates['profile-menu-view'],
                leftMenuItems: [
                    {
                        icon: "cubes icon",
                        display: "Apps",
                        name: "userApps",
                        active: true
                    },
                    {
                        icon: "list layout icon",
                        display: "Activity",
                        name: "userActivity"
                    },
                    {
                        icon: "icon star",
                        display: "Starred",
                        name: "userStarred"
                    }

                ]
            }
        }
    },
    collectionViews: {
        userApps: {
            construct: ProfileCollectionView,
            location: "#profile-collection",
            singleton: true,
            options: {
                rowView: UIBaseAppInfoView,
                pageLength: 2,
                collectionUrl: function () {
                    var url = "/api/1/user/" + this.model.get("user_name") + "/apps";
                    return url;
                },
                subViewOptions: {
                    className: "event"
                }
            }
        },
        userStarred: {
            construct: ProfileCollectionView,
            location: "#profile-collection",
            singleton: true,
            options: {
                rowView: UIBaseAppInfoView,
                pageLength: 2,
                collectionUrl: function () {
                    return "/api/1/list/latest";
                    // var url = "/api/1/user/" + this.model.get("user_name") + "/apps";
                    // return url;
                },
                subViewOptions: {
                    className: "event"
                }
            }
        }
    }
};
