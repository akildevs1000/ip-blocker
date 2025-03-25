const { exec } = require('child_process');
const fs = require('fs');
require('dotenv').config();

// Define whitelisted IPs
const whitelistedIps = ['86.98.6.52']; // Add more if necessary

// Log file path based on environment
const logFile = process.env.NODE_ENV === 'production' ? '/var/log/auth.log' : 'auth.log';

// Function to block an IP using ufw
const blockIP = (ip) => {
    return new Promise((resolve, reject) => {
        exec(`sudo ufw deny from ${ip}`, (err, stdout, stderr) => {
            if (err) {
                reject(`Error blocking IP ${ip}: ${stderr}`);
            }
            resolve(`IP ${ip} blocked using ufw.`);
        });
    });
};

// Read the log file
fs.readFile(logFile, 'utf8', async (err, data) => {
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

    // Block the attacker IPs synchronously
    for (const ip of attackerIps) {
        try {
            console.log(`Blocking IP: ${ip}`);
            const result = await blockIP(ip);
            console.log(result);
        } catch (error) {
            console.error(error);
        }
    }
});
