import http from 'http';

const data = JSON.stringify({
    resourceType: 'FOLDER',
    resourceId: '2cb1113d-9117-4708-ae8d-52eadd163bb8'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/link-shares',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log("Status:", res.statusCode);
        console.log("Response:", body);
    });
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
