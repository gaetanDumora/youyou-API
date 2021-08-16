// import { authenticate } from './credentials/auth.js'
import { readFile, writeFile } from 'fs/promises'
import { google } from 'googleapis'

const youtube = google.youtube({
    version: 'v3',
    auth: 'AIzaSyATuH7XAJwI0huSEnuiQjEs_zriKl3-WVQ'
})
const ytanalytics = google.youtubeAnalytics('v2')
const scopes = [
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtubepartner',
    'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
]
const { credentials, _clientId, _clientSecret, redirectUri } = JSON.parse(await readFile('./credentials/oauth2client.json', { encoding: 'utf8' }))
const oauth2Client = new google.auth.OAuth2(_clientId,_clientSecret,redirectUri)

oauth2Client.on('tokens', async tokens => {
    console.log('__TOKEN EVENT__')
    if(tokens.refresh_token){
        console.log('REFRESH!!',tokens)
        await writeFile(new URL('credentials/newoauth2client.json', import.meta.url), JSON.stringify(tokens))
    }
    console.log(tokens)
})

async function main() {
    try {
        // const o = await authenticate(scopes)
        oauth2Client.credentials = credentials
        google.options({ auth: oauth2Client })
        // const res = await ytanalytics.reports.query({
        //     ids: "channel==UCGhA-OOJNYfA3NszdCyeL7g",
        //     startDate: '2021-01-01',
        //     endDate: '2021-02-01',
        //     metrics: 'views'
        // })
        // console.log(res)

//videoId: 'muDT1CW6PEc'
        const res = await youtube.search.list({
            part: 'id,snippet',
            q: 'zigzag, petzl',
            maxResults: 20,
            order: 'date'
        })
        console.log(res.data.items)
    } catch (error) {
        console.log(error)
    }

}
main()