import { Song } from "@/types/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react"

const useLoadSongUrl = (song: Song)=> {
    const supabaseClient = useSupabaseClient();
    if(!song){
        return '';
    }
    const {data: songData} = supabaseClient.storage.from('songs').getPublicUrl(song.song_path);
    console.log(songData)
    return songData.publicUrl;
};
export default useLoadSongUrl;