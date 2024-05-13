const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const parsedData = data.toString().split('\r\n')
        const [startLine, headers] = parsedData

        const path = startLine.split(' ').filter((data) => data.startsWith('/'))[0]
        const endpoint = path.split('/')[2]

        if (path == '/user-agent') {
            const content = parsedData[2].split(' ')[1]
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`)
        }

        const echo = path.split('/')[1]
        if (echo == 'echo') {
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${endpoint.length}\r\n\r\n${endpoint}`)
        }

        if (path == '/') {
            socket.write('HTTP/1.1 200 OK\r\n\r\n')
        }
        else {
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n')

        }
    })
    socket.on("close", () => {
        socket.end();
        server.close();
    });
});

server.listen(4221, "localhost");
