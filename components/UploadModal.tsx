"use client";
import uniqid from 'uniqid';
import React, { useRef, useState } from 'react'
import Modal from './Modal';
import useUploadModal from '@/hooks/useUploadModal';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import Input from './Input';
import Button from './Button';
import { toast } from 'react-hot-toast';
import { useUser } from '@/hooks/useUser';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import * as ytdl from 'ytdl-core';
import axios from 'axios';

export function youtube_parser(url:string) {
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : false;
}

const UploadModal = () => {
    const [urlResult, setUrlResult] = useState<{ link: string, title: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const uploadModal = useUploadModal();
    const supabaseClient = useSupabaseClient();
    const { user } = useUser();
    const router = useRouter();
    const inputUrl = useRef<HTMLInputElement | null>(null); // Define the correct type
    // const [urlResult, setUrlResult] = useState(null);
    const separator = "-";
    const parts = urlResult?.title.split(separator).map(part=>part.trim());
    if(parts){
      if (parts.length >= 2) {
        parts[1] = parts![1].replace("(Official Video)", "").trim();
        try{
          parts[1] = parts![1].replace("(Official Music Video)", "").trim();
        }catch(error){console.log(error)}
      }
    }
    const {
      register,
      handleSubmit,
      reset,
    } = useForm<FieldValues>({
      defaultValues: {
        author: '',
        title: '',
        song: null,
        image: null,
      }
    });
    
    const handleDownload = async () => {
      try{
        if(inputUrl.current){
          const youtubeID = youtube_parser(inputUrl.current.value);
          console.log(youtubeID)
          const options = {
            method: 'GET',
            url: 'https://youtube-mp36.p.rapidapi.com/dl',
            params: {id: youtubeID},
            headers: {
              'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
            }};
          const response = await axios.request(options);
          console.log(response.data);
          
          axios(options).then(res => setUrlResult(res.data)).catch(err=> console.log(err))
        }
        

        setIsLoading(false);
        toast.success('Audio downloaded from YouTube');
      } catch (error) {
        setIsLoading(false);
        toast.error('Error downloading audio from YouTube');
      }
    };

    const onChange = (open: boolean) => {
      if (!open) {
        reset();
        uploadModal.onClose();
      }
    }
  
    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
      try {
        setIsLoading(true);
        
        const imageFile = values.image?.[0];
        const songFile = values.song?.[0];
  
        if (!imageFile || !songFile || !user) {
          toast.error('Missing fields')
          return;
        }
  
        const uniqueID = uniqid();
  
        // Upload song
        const { 
          data: songData, 
          error: songError 
        } = await supabaseClient
          .storage
          .from('songs')
          .upload(`song-${values.title}-${uniqueID}`, songFile, {
            cacheControl: '3600',
            upsert: false
          });
  
        if (songError) {
          setIsLoading(false);
          return toast.error('Failed song upload');
        }
  
        // Upload image
        const { 
          data: imageData, 
          error: imageError
        } = await supabaseClient
          .storage
          .from('images')
          .upload(`image-${values.title}-${uniqueID}`, imageFile, {
            cacheControl: '3600',
            upsert: false
          });
  
        if (imageError) {
          setIsLoading(false);
          return toast.error('Failed image upload');
        }
  
        
        // Create record 
        const { error: supabaseError } = await supabaseClient
          .from('songs')
          .insert({
            user_id: user.id,
            title: values.title,
            author: values.author,
            image_path: imageData.path,
            song_path: songData.path
          });
  
        if (supabaseError) {
          return toast.error(supabaseError.message);
        }
        
        router.refresh();
        setIsLoading(false);
        toast.success('Song created!');
        reset();
        uploadModal.onClose();
      } catch (error) {
        toast.error('Something went wrong');
      } finally {
        setIsLoading(false);
      }
    }
  
    return (
      <Modal
        title="Add a song"
        description="Upload an mp3 file"
        isOpen={uploadModal.isOpen}
        onChange={onChange}
      >
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="flex flex-col gap-y-4"
        >
          {urlResult ? <Input value={parts ? parts[1] : 'Add title'} type='text' id='title' placeholder={urlResult.title} disabled={isLoading} {...register('title', { required: true })}></Input>: <Input id='title' placeholder="Add the title" disabled={isLoading} {...register('title', { required: true })}></Input>}
          
          <Input
            value={parts ?  parts[0] : 'Add song'}
            id="author"
            disabled={isLoading}
            {...register('author', { required: true })}
            placeholder={parts ? parts[0] : "Song author"}
          />
          <div>
            <div className="pb-1">
              Select a song file
            </div>
            <div className='flex flex-row'>
              <Input
                placeholder="test" 
                disabled={isLoading}
                type="file"
                accept=".mp3"
                id="song"
                {...register('song', { required: true })}
              />
            </div>    
          </div>
          <div>
            <div>
              Download a song from youtube
            </div>
            <Input
              id="urly"
              placeholder="YouTube URL"
              type="text"
              ref={inputUrl} // Bind value to state
              disabled={isLoading}
            />
            <div className="mx-4">
              <Button type={'button'} onClick={handleDownload} disabled={isLoading}>
                Download
              </Button>
              {urlResult ? <a target='_blank' rel="noreferrer" href={urlResult.link} className="download_btn">Download MP3</a> : ''}
            </div>
          </div>
          <div>
            <div className="pb-1">
              Select an image
            </div>
            <Input
              placeholder="test" 
              disabled={isLoading}
              type="file"
              accept="image/*"
              id="image"
              {...register('image', { required: true })}
            />
          </div>
          <Button disabled={isLoading} type="submit">
            Create
          </Button>
        </form>
      </Modal>
    );
  }
  
  export default UploadModal;