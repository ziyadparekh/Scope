'use strict';

var Templates = require("@templates/ProfileWrapperTemplate");
var ProfileMenuView = require('views/profile/ProfileMenuView');
var ProfileImageView = require('views/profile/ProfileImageView');
var ProfileNameView = require('views/UITextView');

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
                        name: "apps",
                        active: true
                    },
                    {
                        icon: "list layout icon",
                        display: "Activity",
                        name: "activity" 
                    },
                    {
                        icon: "icon star",
                        display: "Starred",
                        name: "starred"
                    }

                ]
            }
        }
    }
};