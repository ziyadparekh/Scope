'use strict';

var Templates = require("@templates/SettingsWrapperTemplate");
var SettingsMenuView = require('views/settings/SettingsMenuView');
var ApplicationsSettingsView = require('views/settings/ApplicationsSettingsView');

module.exports = {
    template: Templates['settings-wrapper-view'],
    subViewConfig: {
        settingsMenu: {
            construct: SettingsMenuView,
            location: "#settings-menu",
            singleton: true,
            options: {
                menuHeader: "Personal Settings",
                items: [
                    {
                        name: "profile",
                        displayName: "Profile",
                        active: true,
                    },
                    {
                        name: "applications",
                        displayName: "Applications",
                        active: false
                    }
                ]
            }
        },
        applications: {
            construct: ApplicationsSettingsView,
            location: "#settings-item",
            singleton: true,
            options: {}
        }
    }
};
