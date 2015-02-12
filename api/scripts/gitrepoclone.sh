#!/bin/bash
# post-commit hook to create git file directory for node subdomain

echo ""
echo ""
echo -e "
       _                     _
  __ _| |_ ___  _ __ ___    / \   _ __  _ __
 / _' | __/ _ \| '_ ' _ \  / _ \ | '_ \| '_ \
| (_| | || (_) | | | | | |/ ___ \| |_) | |_) |
 \__,_|\__\___/|_| |_| |_/_/   \_\ .__/| .__/
                                 |_|   |_|

          \033[1mOpen Source Node.js Hosting Platform.\033[22m
              http://github.com/AtomApp"
echo ""
echo ""


SECRETKEY="PleaseRestartMyAppMKey"
#GITBASE=/Users/ziyadparekh/Scope/git
#APPSBASE=/Users/ziyadparekh/Scope/app

GITBASE=/Users/ziyad/scope/git
APPSBASE=/Users/ziyad/scope/app

OLD_PWD=$PWD
gitdirsuffix=${PWD##*/}
gitdir=${gitdirsuffix%.git}
GITBASELEN=${#GITBASE};
OLD_PWDLEN=${#OLD_PWD};
MY_LEN=$(( ${OLD_PWDLEN} - ${GITBASELEN} - 4 ));
appdir="${APPSBASE}${OLD_PWD:${GITBASELEN}:${MY_LEN}}";

if [ -d "${appdir}" ]; then
  echo "Syncing repo with container"
  cd ${appdir};
  unset GIT_DIR;
  git pull;
else
  echo "Fresh git clone into container"
  mkdir -p ${appdir};
  git clone . ${appdir};
  cd ${appdir};
fi

hook=./.git/hooks/post-receive
if [ -f "$hook" ]; then
    rm $hook
fi

if [ -f ./.gitmodules ]; then
    echo "Found git submodules, updating them now..."
    git submodule init;
    git submodule update;
fi

# if [ -f ./package.json ]; then
#     echo "Updating npm modules..."
#     npm install
# fi

cd $OLD_PWD

echo "Attempting to restart your app: ${gitdir}"
curl -X GET "http://localhost:3010/api/1/apps/reboot?repo_id=${gitdir}&restart_key=${SECRETKEY}"
echo ""
echo "App restarted.."
echo ""
echo "  \m/ Nodester out \m/"

exit 0;
