import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';

export const httpServer = http.createServer(function(req, res) {
    const DIRNAME = path.resolve(path.dirname(''));
    const fileЗath = DIRNAME + (req.url === '/' ? '/front/index.html' : '/front' + String(req.url));
    fs.readFile(fileЗath, function(err, data) {
        if (err != null) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
});
