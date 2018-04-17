#!/bin/sh

# Update server files
git push live master

remote_user="USER"
remote="$remote_user@server.projectcosmic.co.uk"
theme="public_html/themes/custom/{{ NAME }}"

# Delete old files
ssh $remote "rm -rf /home/$remote_user/$theme/dist"

# Copy compiled files to server
scp -r "$theme/dist" "$remote:/home/$remote_user/$theme"
