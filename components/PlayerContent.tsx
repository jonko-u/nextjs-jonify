'use client';

import { Song } from "@/types/types";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import {BsPauseFill, BsPlayFill} from "react-icons/bs";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import Slider from "./Slider";
import usePlayer from "@/hooks/usePlayer";
import { useEffect, useMemo, useState } from "react";
import {Howl} from 'howler';
import {ImLoop, ImLoop2} from 'react-icons/im';
import { FaRandom } from "react-icons/fa";
import { TbArrowsRandom } from "react-icons/tb";
import React from "react";
import { toast } from "react-hot-toast";
interface PlayerContentProps{
    song: Song;
    songUrl: string;
}

const PlayerContent:React.FC<PlayerContentProps> = ({song, songUrl}) => {
    const player = usePlayer();
    const [volume, setVolume] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [isRandom, setIsRandom] = useState(false); 
    const [currentPosition, setCurrentPosition] = useState(0);
    const [soundInstance, setSoundInstance] = useState<Howl | null>(null);

    const Icon = isPlaying ? BsPauseFill : BsPlayFill;
    const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;


    const onPlayNext = () => {
        if(player.ids.length === 0){
            return;
        }
        const currentIndex = player.ids.findIndex((id)=> id === player.activeId);
        const nextSong = player.ids[currentIndex+1];
        
        if (!nextSong){
            return player.setId(player.ids[0], isLooping);
        }
        if(isRandom){
            sound.stop();
            player.setId(nextSong, isLooping);
        }else{
            sound.stop();
            const randomIndex = Math.floor(Math.random() * player.ids.length);
            player.setId(player.ids[randomIndex], isLooping);}
        
    };
    const onPlayPrevious = () => {
        if(player.ids.length === 0){
            return;
        }
        
        const currentIndex = player.ids.findIndex((id)=> id === player.activeId);
        const previousSong = player.ids[currentIndex-1];
        
        if (!previousSong){
            return player.setId(player.ids[player.ids.length-1], isLooping);
        }
        if(isPlaying){
            sound.stop();
            setIsPlaying(false);
        
            // Introduce a 2-second delay before playing again
            setTimeout(() => {
              sound.play();
              setIsPlaying(true);
            }, 1200); 
        }else{player.setId(previousSong, isLooping);}
        
    };
    const toggleRandom = () => {
        console.log('random',isRandom);
        if (!isRandom) {
            setIsRandom(false);
        }
        if (isLooping) {
            setIsLooping(false);
        }else{setIsRandom(true);}
        
    };
    
    const toggleLoop = () => {
        
        // if(isLooping === true){
        //     setIsLooping(false);
        //     console.log("loop",isLooping);
        // }else{
        //     setIsLooping(true)
        //     console.log("loop",isLooping);
        // }
        
    };
   
    const sound = useMemo(() => {
        return new Howl({
            
            src: [songUrl],
            volume: volume,
            html5: true,
            
            onplay: () => setIsPlaying(true),
            onpause: () => setIsPlaying(false),
            onend: () => {
                setIsPlaying(false);
                sound.stop();
                console.log('here loop', isLooping)
                if (isLooping === true) {
                    sound.loop(true);
                    sound.play(); // Play the same song again if looping
                } else {
                    
                    onPlayNext(); // Play next song in sequential mode
                }  
            },
            format: ['mp3'],
            });
        }, []);
    
    
      useEffect(() => {
        const playSound = () => {
          sound.play();
        };
    
        const unloadSound = () => {
          sound.unload();
        };
        const updateSliderPosition = () => {
            const currentPosition = sound.seek() || 0;
            setCurrentPosition(currentPosition);
          };
      
        const progressInterval = setInterval(updateSliderPosition, 100); // Update every 100ms
      
        
    
        playSound();
    
        return () => {clearInterval(progressInterval), sound.unload(); };
      }, []);
      
      

    const handleVolumeChange = (value: number) => {
        sound.volume(value); // Set the volume of the existing sound
        setVolume(value); // Update the state of the volume
    };
    const handlePositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newPosition = parseFloat(event.target.value);
        setCurrentPosition(newPosition);
        sound.seek(newPosition); // Seek to the new position in the song
      };
    const handlePlay = () =>{
        
        if(!isPlaying){sound.play();}else{sound.pause();}
    };

      
    
    
    const toggleMute = () =>{
        if(volume===0){sound.volume(1); setVolume(1);}else{sound.volume(0); setVolume(0)}
    }

    return(
        <div className="grid grid-cols-2 md:grid-cols-3 h-full">
            <div className="flex w-full justify-start">
                <div className="flex items-center gap-x-4">
                    <MediaItem data={song} />
                    <LikeButton songId={song.id} />
                </div>
            </div>
            <div className="flex md:hidden col-auto w-full justify-end items-center">
                <div onClick={()=>{}} className="h-10 w-10 flex items-center justify-center rounded-full bg-white p-1 cursor-pointer">
                    <Icon size={30} className="text-black"/>                    
                </div>
            </div>
            <div className="hidden h-full md:flex flex-col justify-center items-center w-full max-w-[722px] gap-y-4">
                <div className="flex items-center gap-x-6">
                    {/* Render either the icon or a colored background */}
                    {!isRandom ? (
                        <FaRandom onClick={toggleRandom} />
                    ) : (
                        <div onClick={toggleRandom} className='bg-slate-500 rounded-full p-2 cursor-pointer'>
                            <FaRandom className='text-white' />
                        </div>
                    )}
                    <AiFillStepBackward onClick={onPlayPrevious} size={30} className="text-neutral-400 cursor-pointer hover:text-white transition"/>
                    <div onClick={handlePlay} className="flex items-center justify-center h-10 w-10 rounded-full bg-white p-1 cursor-pointer">
                    <Icon size={30} className="text-black"/>
                    </div>
                    <AiFillStepForward onClick={onPlayNext} size={30} className='text-neutral-400 cursor-pointer hover:text-white transition'/>
                    {!isLooping ? (
                        <ImLoop onClick={toggleLoop}/>
                    ) : (
                        <div onClick={toggleLoop} className='bg-slate-500 rounded-full p-2 cursor-pointer'>
                            <ImLoop className='text-white' />
                        </div>
                    )}
                    
                </div>
                
                {/* Song position slider */}
                <div className="flex items-center w-full max-w-md">
                        <input
                        type="range"
                        min="0"
                        max={sound.duration()}
                        value={currentPosition}
                        onChange={handlePositionChange}
                        step="0.01"
                        className="w-full h-2 rounded-md bg-gray-300 mb-6"
                        />
                </div>
            </div>
            <div className="hidden md:flex w-full justify-end pr-2">
                <div className="flex items-center gap-x-2 w-[120px]">
                    <VolumeIcon onClick={toggleMute}
                    className='cursor-pointer'
                    size={34}
                    />
                    <Slider value={volume} onChange={handleVolumeChange}/>
                </div>                
            </div>
            
        </div>
    )
}
export default PlayerContent;

