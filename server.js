const fs = require('fs');
require('dotenv').config();

// Define whitelisted IPs
const whitelistedIps = ['86.98.6.52'];

// Determine log file path based on environment
const logFile = process.env.NODE_ENV === 'production' ? '/var/log/auth.log' : 'auth.log';
fs.readFile(logFile, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading log file:', err);
        return;
    }
    
    // Match IPs from "Invalid user" and "Failed password for invalid user" logs
    const ipRegex = /Invalid user .* from ([\d.]+) port|Failed password for invalid user .* from ([\d.]+) port/g;
    let match;
    const attackerIps = new Set();
    
    while ((match = ipRegex.exec(data)) !== null) {
        const ip = match[1] || match[2];
        if (ip && !whitelistedIps.includes(ip)) {
            attackerIps.add(ip);
        }
    }
    
    console.log('Attacker IPs:', [...attackerIps]);
});
