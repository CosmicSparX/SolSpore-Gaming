'use client'

import React, { useState, Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { BetDetails, placeBet, getSolBalance } from '@/lib/bettingService'
import { toast } from 'react-hot-toast'

interface BettingModalProps {
  isOpen: boolean
  onClose: () => void
  market: {
    id: string
    question: string
    teamA: string
    teamB: string
    yesOdds: number
    noOdds: number
  }
  tournamentId: string
  outcome: 'yes' | 'no' | null
}

export default function BettingModal({ isOpen, onClose, market, outcome, tournamentId }: BettingModalProps) {
  const [stakeAmount, setStakeAmount] = useState<string>('1.0')
  const [isConfirming, setIsConfirming] = useState<boolean>(false)
  const [betPlaced, setBetPlaced] = useState<boolean>(false)
  const [txSignature, setTxSignature] = useState<string>('')
  const [userBalance, setUserBalance] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'review' | 'custom'>('review')
  
  const { publicKey, connected, signTransaction } = useWallet()
  
  // Predefined stake values
  const stakeOptions = [0.1, 0.5, 1.0, 2.0, 5.0]
  
  // Get user balance when connected
  useEffect(() => {
    if (connected && publicKey) {
      getSolBalance(publicKey).then(balance => {
        setUserBalance(balance);
      });
    }
  }, [connected, publicKey, isOpen]);
  
  // Reset state when modal closes
  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStakeAmount('1.0')
      setIsConfirming(false)
      setBetPlaced(false)
      setTxSignature('')
      setActiveTab('review')
    }, 200)
  }
  
  // Handle stake amount changes
  const handleStakeChange = (value: string) => {
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setStakeAmount(value);
    }
  }
  
  // Handle increment/decrement of stake
  const adjustStake = (amount: number) => {
    const currentStake = parseFloat(stakeAmount) || 0;
    const newStake = Math.max(0.1, currentStake + amount);
    setStakeAmount(newStake.toFixed(1));
  }
  
  // Calculate potential payout based on stake and odds
  const calculatePotentialPayout = () => {
    if (!stakeAmount || isNaN(parseFloat(stakeAmount))) return 0
    
    const stake = parseFloat(stakeAmount)
    const odds = outcome === 'yes' ? market.yesOdds : market.noOdds
    
    return stake * odds
  }
  
  // Format number with 2 decimal places
  const formatNumber = (num: number) => {
    return num.toFixed(2)
  }
  
  // Calculate potential profit
  const calculateProfit = () => {
    const payout = calculatePotentialPayout();
    const stake = parseFloat(stakeAmount) || 0;
    return payout - stake;
  }
  
  // Handle bet placement
  const handlePlaceBet = async () => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!outcome) {
      toast.error("No outcome selected");
      return;
    }
    
    const stake = parseFloat(stakeAmount);
    
    if (isNaN(stake) || stake <= 0) {
      toast.error("Please enter a valid stake amount");
      return;
    }
    
    if (userBalance !== null && stake > userBalance) {
      toast.error("Insufficient balance");
      return;
    }
    
    setIsConfirming(true);
    
    try {
      // Prepare the bet details
      const betDetails: BetDetails = {
        marketId: market.id,
        outcome,
        amount: stake,
        tournamentId: tournamentId
      };
      
      // Place the bet on Solana
      const signature = await placeBet(publicKey, signTransaction, betDetails);
      
      // Save the transaction signature
      setTxSignature(signature);
      
      // Update UI to show success
      setBetPlaced(true);
      toast.success("Bet placed successfully!");
      
      // Update user balance after bet
      if (publicKey) {
        const newBalance = await getSolBalance(publicKey);
        setUserBalance(newBalance);
      }
      
      // Automatically close after success
      setTimeout(handleClose, 3000);
      
    } catch (error) {
      console.error("Error placing bet:", error);
      toast.error((error as Error).message || "Failed to place bet");
    } finally {
      setIsConfirming(false);
    }
  };
  
  const insufficientBalance = userBalance !== null && parseFloat(stakeAmount) > userBalance;
  const potentialProfit = calculateProfit();
  const isProfitPositive = potentialProfit > 0;
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                <div className="relative">
                  {/* Header with close button */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                    <div className="flex justify-between items-center">
                      <Dialog.Title as="h3" className="text-lg font-bold text-white">
                        Place Your Bet
                      </Dialog.Title>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="text-white hover:text-gray-200 focus:outline-none"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                
                  {/* Main content */}
                  {!connected && (
                    <div className="text-center py-12 px-6">
                      <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6">
                        <ExclamationCircleIcon className="h-10 w-10 text-yellow-600 dark:text-yellow-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">Connect Your Wallet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                        Please connect your Solana wallet to place a bet on this market.
                      </p>
                      <button
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:translate-y-[-2px] shadow-md hover:shadow-lg"
                        onClick={handleClose}
                      >
                        Connect Wallet
                      </button>
                    </div>
                  )}
                  
                  {connected && !betPlaced && (
                    <div>
                      {/* Market info */}
                      <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="font-bold text-lg mb-1">{market.question}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>{market.teamA}</span>
                          <span className="text-gray-400 dark:text-gray-500">vs</span>
                          <span>{market.teamB}</span>
                        </div>
                      </div>
                      
                      {/* Bet selection highlight */}
                      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/30">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Your prediction</span>
                            <div className="flex items-center mt-1">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                                outcome === 'yes' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                              }`}>
                                {outcome === 'yes' ? 
                                  <span className="text-xs">✓</span> : 
                                  <span className="text-xs">✗</span>
                                }
                              </div>
                              <span className={`font-semibold ${
                                outcome === 'yes' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              }`}>
                                {outcome === 'yes' ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Odds</span>
                            <span className="text-xl font-bold">
                              {outcome === 'yes' ? formatNumber(market.yesOdds) : formatNumber(market.noOdds)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stake input section tabs */}
                      <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                          className={`flex-1 py-3 text-center font-medium ${
                            activeTab === 'review' 
                              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                          onClick={() => setActiveTab('review')}
                        >
                          Quick Stake
                        </button>
                        <button
                          className={`flex-1 py-3 text-center font-medium ${
                            activeTab === 'custom' 
                              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                          onClick={() => setActiveTab('custom')}
                        >
                          Custom Amount
                        </button>
                      </div>
                      
                      {/* Stake input area */}
                      <div className="px-6 py-5">
                        {activeTab === 'review' ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Select stake amount
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Balance: {userBalance !== null ? formatNumber(userBalance) : '---'} SOL
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                              {stakeOptions.map((option) => (
                                <button 
                                  key={option} 
                                  className={`py-2 px-3 rounded-lg border ${
                                    parseFloat(stakeAmount) === option
                                      ? 'bg-blue-500 text-white border-blue-600'
                                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                  }`}
                                  onClick={() => setStakeAmount(option.toString())}
                                >
                                  {option} SOL
                                </button>
                              ))}
                            </div>
                            
                            <button
                              className="w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
                              onClick={() => setActiveTab('custom')}
                            >
                              Custom Amount
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                              <label htmlFor="stake" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Enter stake amount
                              </label>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Balance: {userBalance !== null ? formatNumber(userBalance) : '---'} SOL
                              </span>
                            </div>
                            
                            <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                              <input
                                type="text"
                                id="stake"
                                value={stakeAmount}
                                onChange={(e) => handleStakeChange(e.target.value)}
                                placeholder="Enter amount"
                                className={`flex-1 px-4 py-3 outline-none ${
                                  insufficientBalance 
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300' 
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                                }`}
                              />
                              <div className="flex flex-col border-l border-gray-300 dark:border-gray-700">
                                <button 
                                  className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => adjustStake(0.1)}
                                >
                                  <ChevronUpIcon className="h-4 w-4" />
                                </button>
                                <button 
                                  className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => adjustStake(-0.1)}
                                  disabled={parseFloat(stakeAmount) <= 0.1}
                                >
                                  <ChevronDownIcon className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 px-4">
                                <span className="font-medium">SOL</span>
                              </div>
                            </div>
                            
                            {insufficientBalance && (
                              <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                                Insufficient balance
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Bet summary */}
                        <div className="mt-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                          <h5 className="font-medium mb-2">Bet Summary</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Your stake:</span>
                              <span className="font-medium">{parseFloat(stakeAmount) || 0} SOL</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Potential return:</span>
                              <span className="font-medium">{formatNumber(calculatePotentialPayout())} SOL</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-blue-200 dark:border-blue-800">
                              <span className="text-gray-600 dark:text-gray-400">Potential profit:</span>
                              <span className={`font-bold ${isProfitPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {isProfitPositive ? '+' : ''}{formatNumber(potentialProfit)} SOL
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                        <button
                          type="button"
                          className="flex-1 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={handleClose}
                          disabled={isConfirming}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-all shadow-md 
                            ${isConfirming 
                              ? 'bg-blue-400 cursor-wait' 
                              : insufficientBalance || !stakeAmount || parseFloat(stakeAmount) <= 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                            }
                          `}
                          onClick={handlePlaceBet}
                          disabled={isConfirming || insufficientBalance || !stakeAmount || parseFloat(stakeAmount) <= 0}
                        >
                          {isConfirming ? (
                            <div className="flex items-center justify-center">
                              <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                              Processing...
                            </div>
                          ) : (
                            'Confirm Bet'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Success state */}
                  {connected && betPlaced && (
                    <div className="p-6">
                      <motion.div 
                        className="text-center py-10 px-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                          <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Bet Placed Successfully!</h3>
                        <div className="mb-6 max-w-xs mx-auto">
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            Your bet of <span className="font-semibold">{stakeAmount} SOL</span> has been placed.
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Potential return: <span className="font-medium">{formatNumber(calculatePotentialPayout())} SOL</span>
                          </p>
                        </div>
                        
                        {txSignature && (
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50 mx-auto max-w-sm">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction ID:</p>
                            <a
                              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:text-blue-600 font-mono break-all"
                            >
                              {txSignature.slice(0, 20)}...{txSignature.slice(-10)}
                            </a>
                          </div>
                        )}
                        
                        <button
                          onClick={handleClose}
                          className="mt-6 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 py-2 px-6 rounded-lg font-medium transition-colors"
                        >
                          Close
                        </button>
                      </motion.div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 