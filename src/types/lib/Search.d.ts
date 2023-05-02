import PlaylistInfo from './PlaylistInfo'
import Track from './Track'

export interface Search {
    playlistInfo: PlaylistInfo,
    loadType: 'SEARCH_RESULT' | 'PLAYLIST_LOADED' | 'LOAD_FAILED' | 'NO_MATCHES' | 'TRACK_LOADED',
    tracks: Track[]
}