const fs = require('fs');
const pidusage = require('pidusage');

const PID = process.argv[2];
const HOSTNAME = 'localhost:9001';
const SERVER_ENDPOINT = `http://${HOSTNAME}`;
const LOG_FILE = fs.createWriteStream(`watchdog.${PID}.log`);
//const MAX_SEQUENCIAL_ERRORS = 2;
//const RESPONSE_TIMEOUT = 5000;

LOG_FILE.write(`Watching process ${PID}\n\n`);

async function checkProcessHealth () {
  LOG_FILE.write('\nChecking...');  
  return new Promise((resolve, reject) => {
    pidusage(PID, (err, stats) => {
      if (err) {
        return reject(err);
      }

      LOG_FILE.write(`\nCPU: ${stats.cpu}%; Memory: ${(stats.memory / 1024 / 1024)}MB`);
      resolve(stats);
    });
  });
}

function executeNext () {
  setTimeout(() => {
    checkProcessHealth()
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        executeNext();
      });
  }, 10000);
};

executeNext();