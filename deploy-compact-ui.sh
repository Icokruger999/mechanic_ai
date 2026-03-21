#!/bin/bash
cd /var/www/mechanic-ai
git pull origin master
rm -rf .next
npm run build
pm2 restart mechanic-ai
pm2 save
echo "Deployed successfully"
