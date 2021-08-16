import { createServer } from 'http'

const PORT = 3000
const s = createServer()

function requestHandler(req, res) {
    const { host } = req.headers.host
    const u = new URL(req.url, `http://${host}`)

    if (req.url.match('oauth2callback')) {
        const code = u.searchParams.get('code')
        res.setHeader('Content-Type', 'text/html')
        res.writeHead(200)
        res.write(`<p>${code}</p>`)
        res.end()
    }
    else {
        res.setHeader('Content-Type', 'text/html')
        res.writeHead(200)
        res.write(`<h3>Node_server</h3>`)
        res.end()
    }
}

s.on('request', requestHandler)
s.listen(PORT, () => console.log(`server listen ${PORT}`))

