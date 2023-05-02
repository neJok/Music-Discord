import Track from '@customTypes/lib/Track'

interface IString {
    [key: string]: Track
}

export default interface Queue {
    text: string,
    loop: boolean,
    loopQueue: boolean,
    lasts: IString,
    volume: number,
    pause: number,
    filters: {
        vaporwave: boolean,
        nightcore: boolean,
        _8d: boolean,
        vibrato: boolean,
        tremolo: boolean,
        vibrate: boolean,
        speed: boolean,
        china: boolean,
        slowmotion: boolean,
        karaoke: boolean,
        bassHigh: boolean,
        bassMedium: boolean,
        bassLow: boolean
    },
    songs: Track[]
}