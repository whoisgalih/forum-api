const { exec } = require('child_process');

exec('psql -U developer -d planties -f ./truncate.sql', (err, stdout, stderr) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(stdout);
});
