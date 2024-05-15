const net = require("net");
const { argv } = require('node:process')
const fs = require('fs')
const paths = require('path')
const zlib = require('zlib')

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");


let dir
// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const parsedData = data.toString().split('\r\n')
        const [startLine, headers] = parsedData


        const path = startLine.split(' ').filter((data) => data.startsWith('/'))[0]
        const status = startLine.split(' ')[0]
        const contents = parsedData.pop()
        const endpoint = path.split('/')[2]
        const acceptencoding = parsedData[2]




        if (status == 'GET') {
            if (path == '/user-agent') {
                const content = parsedData[2].split(' ')[1]
                socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`)
            }

            const pathname = path.split('/')[1]
  
            if (pathname == 'echo') {
                const encodingsArray = !!acceptencoding && acceptencoding.split(':')[1].split(',')
                const validEncoding = !!encodingsArray && encodingsArray.some((data) => data.toLowerCase().trim() == 'gzip')

                if (acceptencoding && validEncoding) {
                    compressZlib(endpoint, socket)
                    // socket.write(`HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\nContent-Type: text/plain\r\nContent-Length: 4\r\n\r\n`)
                } else {
                    socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${endpoint.length}\r\n\r\n${endpoint}`)
                }


            }

            if (pathname == 'files') {
                const fileName = path.split('/files/')[1]

                const filePath = paths.join(dir, fileName)

                if (fs.existsSync(filePath)) {
                    const data = fs.readFileSync(filePath, { encoding: 'utf-8' })
                    socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${data.length}\r\n\r\n${data}`)
                }
            }

            if (path == '/') {
                socket.write('HTTP/1.1 200 OK\r\n\r\n')
            }
            else {
                socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
            }


        }
        if (status == 'POST') {
            const pathname = path.split('/')[1]
            if (pathname == 'files') {
                const fileName = path.split('/files/')[1]
                const filePath = paths.join(dir, fileName)

                fs.writeFileSync(filePath, contents)

                socket.write('HTTP/1.1 201 Created\r\n\r\n')
            }
        }


    })
    socket.on("close", () => {
        socket.end();
        server.close();
    });
});

const compressZlib = (content, socket) => {
    const gzipBody = zlib.gzipSync(Buffer.from(content, "utf8"));
    socket.write(`HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\nContent-Type: text/plain\r\nContent-Length: ${gzipBody.length}\r\n\r\n`);
    socket.write(gzipBody)
}

argv.forEach((val, index) => {
    if (val == '--directory') {
        dir = argv[index + 1]
    }

})

server.listen(4221, "localhost");
