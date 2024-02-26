//runScript.js
const { spawn } = require('child_process');
const path = require('path');

// Function to run a script
function runScript(scriptPath) {
    console.log(`Running ${scriptPath}...`);
    return new Promise((resolve, reject) => {
        const child = spawn('node', [scriptPath], { stdio: 'inherit' });

        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Script ${scriptPath} exited with non-zero exit code ${code}`));
                return;
            }
            console.log(`${scriptPath} completed successfully.`);
            resolve();
        });

        child.on('error', (err) => {
            reject(err);
        });
    });
}

runScript(path.join(__dirname, 'emailer.js'))
runScript(path.join(__dirname, 'api.js'))
