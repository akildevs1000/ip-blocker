const express = require('express');
const fs = require('fs');
const app = express();
const ip = "139.59.69.241";
const port = 9923; // Port number to use

// Path to the Fail2Ban log file
const logFilePath = '/var/log/fail2ban.log';  // Update this path if necessary

// Function to read and parse the Fail2Ban log file
const getBannedIPs = () => {
    const logData = fs.readFileSync(logFilePath, 'utf8');
    const banPattern = /\[sshd\] Ban (\d+\.\d+\.\d+\.\d+)/g; // Updated regex to match [sshd] Ban
    const bannedIPs = [];
    let match;

    // Extract banned IPs using regex
    while ((match = banPattern.exec(logData)) !== null) {
        bannedIPs.push(match[1]);
    }

    return bannedIPs;
};

// Endpoint to serve the banned IPs in an HTML page
app.get('/', (req, res) => {
    const bannedIPs = getBannedIPs();
    let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Banned IPs</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <h1>Banned IP Addresses</h1>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Banned IP</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Loop through banned IPs and add them to the table
    bannedIPs.forEach((ip, index) => {
        htmlContent += `
            <tr>
                <td>${index + 1}</td>
                <td>${ip}</td>
            </tr>
        `;
    });

    // Close the table and HTML tags
    htmlContent += `
            </tbody>
        </table>
    </body>
    </html>
    `;

    res.send(htmlContent);
});

// Start the server on the updated port
app.listen(port, ip, () => {
    console.log(`Server running at http://${ip}:${port}`);
});
