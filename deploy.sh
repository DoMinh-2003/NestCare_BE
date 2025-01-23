echo "Building app..."
sudo npm run build || { echo "Build failed"; exit 1; }

echo "Deploy files to server..."
scp -v -r dist/* root@14.225.207.163:/var/www/nestjs-app/ || { echo "SCP failed"; exit 1; }

echo "Connecting to server to check if app is running..."
ssh root@14.225.207.163 <<EOF
    pid=\$(sudo lsof -t -i:3000)  # Giả sử ứng dụng chạy trên port 3000

    if [ -z "\$pid" ]; then
        echo "Start server..."
        cd /var/www/nestjs-app
        pm2 start /var/www/nestjs-app/main.js --name nestjs-app
    else
        echo "Restart server..."
        pm2 restart nestjs-app
    fi
EOF

echo "Done!"
