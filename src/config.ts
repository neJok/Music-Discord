import { GatewayIntentBits } from 'discord.js'

export const center: string = ''

export const providers: string[] = [
    '',
]

export const lavalink = {
    password: '',
    host: {
        ip: '',
        port: 2005
    }
}

export const radioLavalink = {
    password: '',
    host: '',
    port: 2005
}


export const mongoUrl: string = ''

export const intents: GatewayIntentBits[] = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessageReactions
]

export const meta = {
    guild: '',
    channelLogger: ''
}

export const mainColor = 0x2f3136

export const genius = ''

export const emojis = {
    progess: {
        start: '<:ProgessStart:1082564049209917491>',
        full: '<:ProgessFull:1082564053936898048>',
        end: '<:ProgessEnd:1082564051026067568>',
        move: {
            start: '<:ProgessMoveStart:1082564041802776677>',
            full: '<:ProgessMoveFull:1082564046349410374>',
            end: '<:ProgessMoveEnd:1082564043442770011>'
        }
    },
    player: {
        shuffle: '<:Shuffle2:1082572633981333584>',
        back: '<:Back2:1082572628910420039>',
        pause: '<:Pause2:1082572630613311528>',
        resume: '<:Resume2:1082572645989613588>',
        forward: '<:Forward2:1082572642499952640>',
        repeatDisabled: '<:RepeatDisabled2:1082576443776708679>',
        repeatTrack: '<:RepeatTrack2:1082572637315797062>',
        repeatQueue: '<:RepeatQueue2:1082572650817261659>',
        seek: '<:Seek3:1082578410007711825>',
        volume: '<:Volume2:1082572667510607872>',
        disconnect: '<:Disconnect2:1082572654797656084>',
        lyric: '<:Lyric2:1082572657599459431>',
        heart: '<:Heart2:1082583098077749311>'
    },
    manageSeek: {
        back: '<:SeekBack:1082589924550782996>',
        set: '<:VolumeSet:1082586817834008576>',
        forward: '<:SeeForward:1082589926836674630>',
        start: '<:SeekStart:1082588491466153986>'
    },
    manageVolume: {
        min: '<:VolumeMin:1082586819645943828>',
        max: '<:VolumeMax:1082586814361129011>',
        set: '<:VolumeSet:1082586817834008576>'
    },
    lock: '🔒',
    unlock: '🔓',
    check: '✅',
    cross: '❌'
}

export const maxPlaylists: number = 15

export const radio = [
    {
        token: '',
        type: 'Relax',
        channelId: '1081259975764090960',
        url: 'https://www.youtube.com/watch?v=2OM7adQl-YQ'
    }, {
        token: '',
        type: 'Phonk',
        channelId: '1081260001080901642',
        url: 'https://www.youtube.com/watch?v=UYBstGPWYnE'
    }, {
        token: '',
        type: 'Lo-Fi',
        channelId: '1081260043124604989',
        url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk'
    }
]