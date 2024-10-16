import Image from 'next/image'
import SubscribeButton from '../app/components/SubscribeButton'

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-zinc-200 to-white dark:from-zinc-900 dark:to-zinc-800'>
      <div className='z-10 w-full max-w-5xl items-center justify-between font-mono text-sm text-center'>
        <h1 className='mb-8 text-4xl font-bold'>Subscribe to 591 House Notifications</h1>
        <p className='mb-8 text-xl'>Get instant updates on new house listings that match your criteria!</p>
        <SubscribeButton />
      </div>

      {/* <div className='mt-16 flex justify-center'>
        <Image src='/line-logo.png' alt='Line Logo' width={100} height={100} className='dark:invert' />
      </div> */}

      <div className='mt-16 text-center text-sm opacity-50'>
        <p>Powered by Next.js and Line Notify</p>
      </div>
    </main>
  )
}
