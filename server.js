const https = require('https');
const WebSocketServer = require('./WebSocketServer');
const fs = require('fs');
const url = require('url');
const path = require('path');

const HTTPSPORT = 8082;
const WSSPORT = 9494;

const options = {
    key: fs.readFileSync("./YOUR_KEY.key"),
    cert: fs.readFileSync("./YOUR_CERT.crt"),
};

(async () => {
  try {
        // we will need this: await processOpenFinConfigs();
        const server = https.createServer(options, (request, response) => {
            try {
                    process.cwd()
                    var requestUrl = url.parse(request.url)
                    const pathname = requestUrl.pathname == '/' ? '/index.html' : path.normalize(requestUrl.pathname)
                    const fullPath = `${process.cwd()}${pathname}`;
                    console.log(fullPath)
                    var fsPath = path.normalize(fullPath)

                    console.log(fsPath);
                    var fileStream = fs.createReadStream(fsPath)
                    fileStream.pipe(response)
                    fileStream.on('open', function() {
                        response.writeHead(200)
                    })
                    fileStream.on('error', (_ex) => {
                        console.error(_ex)
                        response.writeHead(404)     // assume the file doesn't exist
                        response.end()
                    })
            } catch(e) {
                response.writeHead(500)
                response.end()     // end the response so browsers don't hang
                console.log(e.stack)
            }
        }).listen(HTTPSPORT)
        console.log(`listening to https on port ${HTTPSPORT}`)
    } catch (err) {
        console.error(err);
    }
})();

(async () => {
    try {
        const wssServer = https.createServer(options, (request, response) => {
        res.writeHead(200, {'Content-Type': 'application/json'});

        clientInfo = JSON.stringify({ "ids": wss.getClients() })

        res.write(clientInfo);
        res.end();
    }).listen(WSSPORT) 
    
    console.log(`listening to wss on port ${WSSPORT}`);
    var wss = new WebSocketServer(wssServer);
    } catch (err) {
      console.error(err);
    }
})();

