#!/bin/sh

# Update server files
git push live master

# Copy compiled files to server
dist="public_html/themes/custom/{{ NAME }}/dist"
scp -r $dist "%remote_user%@server_.projectcosmic.co.uk:/home/%remote_user%/$dist"

# Clear cache (choose)
drush cc
