import React from 'react'
import Lefthome from './Lefthome'
import CenterHome from './CenterHome'
import Righthome from './Righthome'

export default function Home() {
  return (
    <div className='w-full flex justify-center items-start bg-gray-50 min-h-screen'>
      <Lefthome />
      <CenterHome />
      <Righthome />
    </div>
  )
}