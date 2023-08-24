import { Figtree, Inter } from 'next/font/google'

import getSongsByUserId from '@/actions/getSongsByUserId'
import Sidebar from '@/components/Sidebar'
import ToasterProvider from '@/providers/ToasterProvider'
import UserProvider from '@/providers/UserProvider'
import ModalProvider from '@/providers/ModalProvider'
import SupabaseProvider from '@/providers/SupabaseProvider'

import './globals.css'
import Player from '@/components/Player'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Jonify',
  description: 'Generated by create next app',
}

export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userSongs = await getSongsByUserId();

  return (
    <html lang="en">
      <body className={inter.className}>
        <ToasterProvider/>
        
        <SupabaseProvider>
          <UserProvider>
            <ModalProvider/>
              <Sidebar songs={userSongs}>
                {children}
              </Sidebar>
              <Player />
          </UserProvider>
        </SupabaseProvider>      
      </body>
    </html>
  )
}
