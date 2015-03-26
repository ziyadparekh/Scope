'use strict';

var Templates = require("@templates/SettingsWrapperTemplate");
var SettingsMenuView = require('views/settings/SettingsMenuView');

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
                        name: "application",
                        displayName: "Applications",
                        active: false
                    }
                ]
            }
        }
    }
};
