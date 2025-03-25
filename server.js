const { exec } = require('child_process');
const fs = require('fs');
require('dotenv').config();

// Define whitelisted IPs
const whitelistedIps = ['86.98.6.52']; // Add more if necessary

// Log file path based on environment
const logFile = process.env.NODE_ENV === 'production' ? '/var/log/auth.log' : 'auth.log';

fs.readFile(logFile, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading log file:', err);
        return;
    }

    // Regular expression to match failed login attempts
    const ipRegex = /Invalid user .* from ([\d.]+) port|Failed password for invalid user .* from ([\d.]+) port/g;
    let match;
    const attackerIps = new Set();

    // Extract IPs
    while ((match = ipRegex.exec(data)) !== null) {
        const ip = match[1] || match[2];
        if (ip && !whitelistedIps.includes(ip)) {
            attackerIps.add(ip);
        }
    }

    // console.table([...attackerIps]);

    // Block the attacker IPs using ufw
    [...attackerIps].forEach(ip => {
        console.log(`Blocking IP: ${ip}`);

        // Run ufw command to block the IP
        exec(`sudo ufw deny from ${ip}`, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error blocking IP ${ip}:`, stderr);
                return;
            }
            console.log(`IP ${ip} blocked using ufw.`);
        });
    });
});
