'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Disclosure, Transition, Menu } from '@headlessui/react'
import { 
  Bars3Icon, 
  XMarkIcon, 
  WalletIcon, 
  ChevronDownIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useAuth } from '@/contexts/AuthContext'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Tournaments', href: '/tournaments' },
  { name: 'My Bets', href: '/my-bets' },
  { name: 'Leaderboard', href: '/leaderboard' },
]

export default function Navbar() {
  const { publicKey, wallet, disconnect, connected, connecting, wallets, select, connect, disconnect: disconnectWallet } = useWallet()
  const { user, logout } = useAuth()
  const [balance, setBalance] = useState<number | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Format SOL balance with appropriate precision
  const formatBalance = (balance: number | null): string => {
    if (balance === null) return '0.00';
    return balance.toFixed(2);
  }
  
  // Handle switching between login and register modals
  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false)
    setIsRegisterModalOpen(true)
  }
  
  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false)
    setIsLoginModalOpen(true)
  }
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <>
      <Disclosure as="nav" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg' : 'bg-gray-900 shadow-md'}`}>
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                {/* Logo and navigation */}
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Link href="/" className="flex items-center group">
                      {/* Logo - now with rounded style */}
                      <div className="w-10 h-10 relative overflow-hidden rounded-full border-2 border-purple-500/50 shadow-md group-hover:shadow-purple-500/20 transition-all duration-300 group-hover:scale-105">
                        <Image 
                          src="/images/SolSpore_Logo.jpg"
                          alt="SolSpore Gaming Logo"
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                      <span className="ml-3 text-xl font-bold tracking-tight group-hover:opacity-80 transition-all">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400">SolSpore</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-400"> Gaming</span>
                      </span>
                    </Link>
                  </div>
                  
                  {/* Desktop navigation */}
                  <div className="hidden sm:ml-10 sm:flex sm:items-center">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`relative px-3 py-2 rounded-md mx-1 text-sm font-medium transition-all duration-300 flex items-center justify-center ${
                            isActive 
                              ? 'text-white bg-purple-600/20 before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-purple-500' 
                              : 'text-gray-300 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          {item.name}
                        </Link>
                      )
                    })}
                    
                    {/* Admin dashboard link if user is admin */}
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className={`relative px-3 py-2 rounded-md mx-1 text-sm font-medium transition-all duration-300 flex items-center justify-center ${
                          pathname === '/admin'
                            ? 'text-white bg-purple-600/20 before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-purple-500' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        Admin
                      </Link>
                    )}
                  </div>
                </div>
                
                {/* Right side: wallet and user actions */}
                <div className="hidden sm:flex sm:items-center space-x-3">
                  {/* User authentication */}
                  {user ? (
                    <>
                      {connected && publicKey ? (
                        <div className="flex items-center px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700">
                          <div className="w-6 h-6 relative mr-2">
                            <Image 
                              src="/images/solana-logo.png"
                              alt="Solana Logo"
                              fill
                              className="rounded-full object-cover"
                            />
                          </div>
                          <span className="font-medium text-sm text-white">{formatBalance(balance)} SOL</span>
                        </div>
                      ) : (
                        <WalletMultiButton className="!bg-gradient-to-r !from-blue-500 !to-purple-600 !rounded-full !py-2 !px-4 !text-sm !font-medium !text-white !shadow-md hover:!shadow-purple-500/20 hover:!scale-105 !transition-all !duration-300">
                          Connect Wallet
                        </WalletMultiButton>
                      )}

                      <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center space-x-2 rounded-full p-1 hover:bg-gray-800 transition-colors">
                          <div className="relative w-8 h-8 overflow-hidden rounded-full border border-gray-700">
                            {user.profileImage ? (
                              <Image 
                                src={user.profileImage}
                                alt={user.username}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <UserCircleIcon className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                        </Menu.Button>
                        
                        <Transition
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-gray-900 border border-gray-800 shadow-lg py-1">
                            <div className="px-4 py-2 border-b border-gray-800">
                              <p className="text-sm text-white font-medium">{user.username}</p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                            
                            {/* Wallet information in dropdown */}
                            {connected && publicKey ? (
                              <div className="px-4 py-2 border-b border-gray-800">
                                <p className="text-xs text-gray-400">Wallet</p>
                                <p className="text-sm text-white font-mono">{publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}</p>
                                <p className="text-xs text-gray-400 mt-1">Balance</p>
                                <p className="text-sm text-white">{formatBalance(balance)} SOL</p>
                              </div>
                            ) : (
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => {}}
                                    className={`block w-full text-left px-4 py-2 text-sm ${
                                      active ? 'bg-gray-800 text-white' : 'text-gray-300'
                                    }`}
                                  >
                                    <WalletMultiButton className="!bg-transparent !p-0 !m-0 !h-auto !w-auto !min-w-0 !text-left !border-none !shadow-none">
                                      Connect Wallet
                                    </WalletMultiButton>
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                            
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href="/profile"
                                  className={`block px-4 py-2 text-sm ${
                                    active ? 'bg-gray-800 text-white' : 'text-gray-300'
                                  }`}
                                >
                                  Profile
                                </Link>
                              )}
                            </Menu.Item>
                            
                            {user.role === 'admin' && (
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    href="/admin"
                                    className={`block px-4 py-2 text-sm ${
                                      active ? 'bg-gray-800 text-white' : 'text-gray-300'
                                    }`}
                                  >
                                    Admin Dashboard
                                  </Link>
                                )}
                              </Menu.Item>
                            )}
                            
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={handleLogout}
                                  className={`block w-full text-left px-4 py-2 text-sm ${
                                    active ? 'bg-gray-800 text-white' : 'text-gray-300'
                                  }`}
                                >
                                  Sign out
                                </button>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsLoginModalOpen(true)}
                        className="text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => setIsRegisterModalOpen(true)}
                        className="text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Sign up
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Mobile menu button */}
                <div className="flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            {/* Mobile menu panel */}
            <Transition
              enter="transition duration-300 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-200 ease-in"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel className="sm:hidden">
                <div className="space-y-1 pb-3 pt-2 px-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className={`block rounded-md px-3 py-2 text-base font-medium ${
                          isActive 
                            ? 'bg-purple-600/20 text-white border-l-4 border-purple-500' 
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {item.name}
                      </Disclosure.Button>
                    )
                  })}
                  
                  {/* Admin dashboard link if user is admin */}
                  {user?.role === 'admin' && (
                    <Disclosure.Button
                      as="a"
                      href="/admin"
                      className={`block rounded-md px-3 py-2 text-base font-medium ${
                        pathname === '/admin'
                          ? 'bg-purple-600/20 text-white border-l-4 border-purple-500' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      Admin Dashboard
                    </Disclosure.Button>
                  )}
                </div>
                <div className="border-t border-gray-700 pt-4 pb-3">
                  {user ? (
                    <div className="px-4 py-2">
                      <div className="flex items-center">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gray-700">
                          {user.profileImage ? (
                            <Image 
                              src={user.profileImage}
                              alt={user.username}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <UserCircleIcon className="h-10 w-10 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-base font-medium text-white">{user.username}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                      
                      {/* Wallet information for mobile */}
                      {connected && publicKey ? (
                        <div className="mt-3 bg-gray-800 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Wallet</span>
                            <span className="text-sm text-white font-mono">{publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-400">Balance</span>
                            <span className="text-sm text-white">{formatBalance(balance)} SOL</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <WalletMultiButton className="!w-full !bg-gradient-to-r !from-blue-500 !to-purple-600 !rounded-md !py-2 !px-4 !text-sm !font-medium !text-white !shadow-md !transition-all !duration-300" />
                        </div>
                      )}
                      
                      <div className="mt-3 space-y-1">
                        <Disclosure.Button
                          as="a"
                          href="/profile"
                          className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          Profile
                        </Disclosure.Button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2 px-4">
                      <button
                        onClick={() => setIsLoginModalOpen(true)}
                        className="w-full text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md text-base font-medium transition-colors"
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => setIsRegisterModalOpen(true)}
                        className="w-full text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-base font-medium transition-colors"
                      >
                        Sign up
                      </button>
                    </div>
                  )}
                  
                  {/* Remove standalone wallet button for mobile */}
                </div>
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />
      
      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  )
} 