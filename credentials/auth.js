import { google } from 'googleapis'
import { readFile, writeFile } from 'fs/promises'
import { createServer } from 'http'
import { get } from 'https'
import destroy from 'server-destroy'
import { exec } from 'child_process'

const openBrowser = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
const PORT = 3000
const credentials = await readFile(new URL('./gcp_id.json', import.meta.url))
const { client_id, client_secret, redirect_uris } = JSON.parse(credentials).web

const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
        console.log('REFRESH_TOKEN')
        console.log(tokens.refresh_token)
    }
    // console.log('ACCESS_TOKEN')
    // console.log(tokens.access_token)
})

export async function authenticate(scopes) {
    return new Promise((resolve, reject) => {
        const authorizeUrl = oauth2Client.generateAuthUrl({
            include_granted_scopes: true,
            scope: scopes.join(' '),
            access_type: 'offline',
            response_type: 'code',
        })
        const s = createServer(async (req, res) => {
            try {
                if (req.url.match('oauth2callback')) {
                    const { host } = req.headers.host
                    const qs = new URL(req.url, `http://${host}`)
                    const code = qs.searchParams.get('code')
                    const error = qs.searchParams.get('error')
                    res.setHeader('Content-Type', 'text/html')
                    res.writeHead(200)
                    if (error) {
                        res.end(`<p>Authentication failed!\n ${error}</p>`)
                    }
                    res.end(`<p>Authentication successful!\n ${code}</p>`)
                    s.destroy()
                    const { tokens } = await oauth2Client.getToken(code)
                    oauth2Client.credentials = tokens
                    await writeFile(new URL('./oauth2client.json', import.meta.url), JSON.stringify(oauth2Client))
                    resolve(oauth2Client)
                }
            } catch (error) {
                reject(error)
            }
        })
        s.listen(PORT, () => {
            exec(`${openBrowser} "${authorizeUrl}"`)
        })
        destroy(s)
    })
}


// const people = google.people('v1')
// async function runSample() {
//     // retrieve user profile
//     const res = await people.people.get({
//         resourceName: 'people/me',
//         personFields: 'emailAddresses',
//     })
//     console.log(res.data)
// }

async function saveOauthJSON(jsFile) {
    const t = {
        created_at: new Date(),
        access_token: jsFile.access_token,
        scope: jsFile.scope,
        token_type: jsFile.token_type,
        expiry_date: new Date(jsFile.expiry_date)
    }
    return await writeFile(new URL('./googleAPIs.json', import.meta.url), JSON.stringify(t))
}

// const scopes = [
//     'https://www.googleapis.com/auth/youtube',
//     'https://www.googleapis.com/auth/youtube.readonly',
//     'https://www.googleapis.com/auth/yt-analytics.readonly'
// ]
// async function main() {
//     try {
//         const client = await authenticate(scopes)
//         console.log("OAUTH2CLIENT")
//         console.log(client)
//         await saveOauthJSON(client.credentials)
//         //await runSample(client)
//     } catch (error) {
//         console.error(error)
//     }
// }
// main()
 