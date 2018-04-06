#!/bin/sh

# Update server files
git push live master

# Copy compiled files to server
theme="public_html/themes/custom/{{ NAME }}"
scp -r "$theme/dist" "REMOTE_USER@server_.projectcosmic.co.uk:/home/REMOTE_USER/$theme"
