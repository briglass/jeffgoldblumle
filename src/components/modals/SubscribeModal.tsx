import { useState } from 'react'

import {
  hasComplimentaryAccess,
  openBillingPortal,
  requestMagicLink,
  startCheckout,
} from '../../lib/subscription'
import { BaseModal } from './BaseModal'

type Props = {
  isOpen: boolean
  handleClose: () => void
  isSubscriber: boolean
}

export const SubscribeModal = ({
  isOpen,
  handleClose,
  isSubscriber,
}: Props) => {
  const [isBusy, setIsBusy] = useState(false)
  const [restoreEmail, setRestoreEmail] = useState('')
  const [linkSent, setLinkSent] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isFreeAccess = hasComplimentaryAccess()

  const handleSubscribe = async () => {
    setIsBusy(true)
    setErrorMessage(null)
    try {
      await startCheckout()
    } catch (e) {
      setErrorMessage('Unable to start checkout. Please try again in a moment.')
      setIsBusy(false)
    }
  }

  const handleSendLink = async () => {
    if (!restoreEmail.trim()) {
      setErrorMessage('Enter the email your access is under.')
      return
    }
    setIsBusy(true)
    setErrorMessage(null)
    try {
      const eligible = await requestMagicLink(restoreEmail.trim())
      if (eligible) {
        setLinkSent(true)
      } else {
        setErrorMessage('No ad-free access found for that email.')
      }
    } catch (e) {
      setErrorMessage(
        'Unable to send the sign-in link right now. Please try again.'
      )
    }
    setIsBusy(false)
  }

  const handleManageBilling = async () => {
    setIsBusy(true)
    setErrorMessage(null)
    try {
      await openBillingPortal()
    } catch (e) {
      setErrorMessage('Unable to open the billing portal. Please try again.')
      setIsBusy(false)
    }
  }

  return (
    <BaseModal title="Go Ad-Free" isOpen={isOpen} handleClose={handleClose}>
      {isSubscriber ? (
        <div className="mt-2 space-y-4 text-left">
          <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
            {isFreeAccess
              ? 'You have complimentary ad-free access on this device. Enjoy!'
              : 'Your ad-free subscription is active on this device. Enjoy the clean experience!'}
          </p>
          {!isFreeAccess && (
            <button
              type="button"
              disabled={isBusy}
              onClick={handleManageBilling}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded shadow transition-colors"
            >
              Manage billing
            </button>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Playing on another device? Open Go Ad-Free there and we&rsquo;ll
            email you a sign-in link.
          </p>
        </div>
      ) : (
        <div className="mt-2 space-y-4 text-left">
          <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
            No ads. No promos. Just you and the raw game.
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
            $9.99<span className="text-sm font-medium">/year</span>
          </p>
          <button
            type="button"
            disabled={isBusy}
            onClick={handleSubscribe}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded shadow transition-colors"
          >
            {isBusy ? 'One moment…' : 'Subscribe with Stripe'}
          </button>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Have a coupon code? You can enter it on the payment page.
          </p>
          <hr className="border-gray-200 dark:border-gray-600" />
          {linkSent ? (
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
              📬 Check your inbox! Open the link on this device to activate
              ad-free access. It expires in 15 minutes.
            </p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Already have access?
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Enter your email and we&rsquo;ll send a one-time sign-in link:
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={restoreEmail}
                  onChange={(e) => setRestoreEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="min-w-0 grow rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handleSendLink}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-bold rounded shadow transition-colors"
                >
                  {isBusy ? 'Sending…' : 'Send link'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {errorMessage && (
        <p className="mt-3 text-sm text-rose-500 text-center">{errorMessage}</p>
      )}
    </BaseModal>
  )
}
