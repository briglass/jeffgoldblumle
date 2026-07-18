import { useState, useEffect } from 'react'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { InfoModal } from './components/modals/InfoModal'
import { StatsModal } from './components/modals/StatsModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { Analytics } from '@vercel/analytics/react'
import {
  WIN_MESSAGES,
  GAME_COPIED_MESSAGE,
  NOT_ENOUGH_LETTERS_MESSAGE,
  WORD_NOT_FOUND_MESSAGE,
  CORRECT_WORD_MESSAGE,
  HARD_MODE_ALERT_MESSAGE,
} from './constants/strings'
import {
  MAX_WORD_LENGTH,
  MAX_CHALLENGES,
  REVEAL_TIME_MS,
  GAME_LOST_INFO_DELAY,
  WELCOME_INFO_MODAL_MS,
} from './constants/settings'
import {
  isWordInWordList,
  isWinningWord,
  solution,
  solutionIndex,
  findFirstUnusedReveal,
  unicodeLength,
} from './lib/words'
import { addStatsForCompletedGame, loadStats } from './lib/stats'
import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
  setStoredIsHighContrastMode,
  getStoredIsHighContrastMode,
} from './lib/localStorage'
import { default as GraphemeSplitter } from 'grapheme-splitter'
import './App.css'
import { AlertContainer } from './components/alerts/AlertContainer'
import { Alert } from './components/alerts/Alert'
import { useAlert } from './context/AlertContext'
import { Navbar } from './components/navbar/Navbar'
import { GoogleAdDisplay } from './components/ads/GoogleAdDisplay'
import { AdsterraNative } from './components/ads/AdsterraNative'
// import { HilltopBanner } from './components/ads/HilltopBanner'

function App() {
  const prefersDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches

  const {
    showError: showErrorAlert,
    showSuccess: showSuccessAlert,
    status,
    message,
    isVisible,
  } = useAlert()

  const [currentGuess, setCurrentGuess] = useState('')
  const [isGameWon, setIsGameWon] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [currentRowClass, setCurrentRowClass] = useState('')
  const [isGameLost, setIsGameLost] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme')
      ? localStorage.getItem('theme') === 'dark'
      : prefersDarkMode
      ? true
      : false
  )
  const [isHighContrastMode, setIsHighContrastMode] = useState(
    getStoredIsHighContrastMode()
  )
  const [isRevealing, setIsRevealing] = useState(false)
  const [guesses, setGuesses] = useState<string[]>(() => {
    const loaded = loadGameStateFromLocalStorage()
    if (
      loaded?.solution !== solution ||
      loaded?.solutionIndex !== solutionIndex
    ) {
      return []
    }
    const gameWasWon =
      loaded.guesses.includes(solution) &&
      loaded?.solutionIndex === solutionIndex
    if (gameWasWon) {
      setIsGameWon(true)
    }
    if (
      loaded.guesses.length === MAX_CHALLENGES &&
      !gameWasWon &&
      loaded?.solutionIndex === solutionIndex
    ) {
      setIsGameLost(true)
      showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
        persist: true,
      })
    }
    return loaded.guesses
  })

  const [stats, setStats] = useState(() => loadStats())

  const [isHardMode, setIsHardMode] = useState(
    localStorage.getItem('gameMode')
      ? localStorage.getItem('gameMode') === 'hard'
      : false
  )

  useEffect(() => {
    if (!loadGameStateFromLocalStorage()) {
      setTimeout(() => {
        setIsInfoModalOpen(true)
      }, WELCOME_INFO_MODAL_MS)
    }
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (isHighContrastMode) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [isDarkMode, isHighContrastMode])

  const handleDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  const handleHardMode = (isHard: boolean) => {
    if (guesses.length === 0 || localStorage.getItem('gameMode') === 'hard') {
      setIsHardMode(isHard)
      localStorage.setItem('gameMode', isHard ? 'hard' : 'normal')
    } else {
      showErrorAlert(HARD_MODE_ALERT_MESSAGE)
    }
  }

  const handleHighContrastMode = (isHighContrast: boolean) => {
    setIsHighContrastMode(isHighContrast)
    setStoredIsHighContrastMode(isHighContrast)
  }

  const clearCurrentRowClass = () => {
    setCurrentRowClass('')
  }

  useEffect(() => {
    saveGameStateToLocalStorage({ guesses, solution, solutionIndex })
  }, [guesses])

  useEffect(() => {
    if (isGameWon) {
      const winMessage =
        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      const delayMs = REVEAL_TIME_MS * MAX_WORD_LENGTH

      showSuccessAlert(winMessage, {
        delayMs,
        onClose: () => setIsStatsModalOpen(true),
      })
    }

    if (isGameLost) {
      setTimeout(() => {
        setIsStatsModalOpen(true)
      }, GAME_LOST_INFO_DELAY)
    }
  }, [isGameWon, isGameLost, showSuccessAlert])

  const onChar = (value: string) => {
    if (
      unicodeLength(`${currentGuess}${value}`) <= MAX_WORD_LENGTH &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setCurrentGuess(`${currentGuess}${value}`)
    }
  }

  const onDelete = () => {
    setCurrentGuess(
      new GraphemeSplitter().splitGraphemes(currentGuess).slice(0, -1).join('')
    )
  }

  const onEnter = () => {
    if (isGameWon || isGameLost) {
      return
    }

    if (!(unicodeLength(currentGuess) === MAX_WORD_LENGTH)) {
      setCurrentRowClass('jiggle')
      return showErrorAlert(NOT_ENOUGH_LETTERS_MESSAGE, {
        onClose: clearCurrentRowClass,
      })
    }

    if (!isWordInWordList(currentGuess)) {
      setCurrentRowClass('jiggle')
      return showErrorAlert(WORD_NOT_FOUND_MESSAGE, {
        onClose: clearCurrentRowClass,
      })
    }

    if (isHardMode) {
      const firstMissingReveal = findFirstUnusedReveal(currentGuess, guesses)
      if (firstMissingReveal) {
        setCurrentRowClass('jiggle')
        return showErrorAlert(firstMissingReveal, {
          onClose: clearCurrentRowClass,
        })
      }
    }

    setIsRevealing(true)
    setTimeout(() => {
      setIsRevealing(false)
    }, REVEAL_TIME_MS * MAX_WORD_LENGTH)

    const winningWord = isWinningWord(currentGuess)

    if (
      unicodeLength(currentGuess) === MAX_WORD_LENGTH &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setGuesses([...guesses, currentGuess])
      setCurrentGuess('')

      if (winningWord) {
        setStats(addStatsForCompletedGame(stats, guesses.length))
        return setIsGameWon(true)
      }

      if (guesses.length === MAX_CHALLENGES - 1) {
        setStats(addStatsForCompletedGame(stats, guesses.length + 1))
        setIsGameLost(true)
        showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
          persist: true,
          delayMs: REVEAL_TIME_MS * MAX_WORD_LENGTH + 1,
        })
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        setIsInfoModalOpen={setIsInfoModalOpen}
        setIsStatsModalOpen={setIsStatsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
      />
      <GoogleAdDisplay />
      {/* <HilltopBanner /> */}
      <div className="pt-0 px-1 pb-8 md:max-w-7xl w-full mx-auto sm:px-6 lg:px-8 flex flex-col grow">
        <div className="grow flex flex-col justify-start pt-1">
          {isVisible && status === 'success' && (
            <div className="mb-2">
              <Alert
                isOpen={isVisible && status === 'success'}
                message={message || ''}
                variant="success"
                inline={true}
              />
            </div>
          )}

          <div className="pb-4 flex flex-col justify-center">
            <Grid
              guesses={guesses}
              currentGuess={currentGuess}
              isRevealing={isRevealing}
              currentRowClassName={currentRowClass}
            />
          </div>

          <div className="pb-4 flex justify-center">
            <p className="text-m font-medium text-black-100 text-center p-0.5 dark:text-white">
              90% of the time, the answer is Jeff Goldblum.
            </p>
          </div>

          <Keyboard
            onChar={onChar}
            onDelete={onDelete}
            onEnter={onEnter}
            guesses={guesses}
            isRevealing={isRevealing}
          />

          <div className="flex justify-center mt-4 mb-4">
            <a
              href="https://www.tiktok.com/@jeffgoldblumle/video/7663631092695502111"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-black hover:bg-zinc-800 text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-zinc-800 dark:border-zinc-700"
            >
              <svg
                className="w-4 h-4 mr-2 fill-current text-white flex-shrink-0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95 1.12 2.27 1.89 3.66 2.18.01 1.25.01 2.5 0 3.75-1.12-.02-2.24-.26-3.27-.73-.83-.37-1.58-.91-2.2-1.58v6.78c.07 1.41-.25 2.85-.98 4.03-.83 1.4-2.14 2.48-3.66 3.02-1.62.62-3.41.65-5.06.08-1.59-.51-3-1.54-3.96-2.94-1.1-1.53-1.55-3.48-1.27-5.35.31-1.88 1.41-3.56 2.99-4.57 1.39-.93 3.08-1.33 4.73-1.13v3.74c-.81-.15-1.66-.02-2.4.34-.73.34-1.32.96-1.62 1.71-.35.83-.32 1.79.1 2.58.41.77 1.16 1.31 2.01 1.48 1.02.21 2.13-.1 2.87-.84.62-.61.94-1.47.92-2.34V0h3.29z" />
              </svg>
              Playing every day until Jeff Goldblum plays
            </a>
          </div>

          <AdsterraNative />

          <div className="pt-4 pb-3 flex flex-col items-center justify-center space-y-3">
            <div className="flex flex-wrap justify-center gap-3 items-center">
              <a
                href="https://brundle.co?utm_source=jeffgoldblumle&utm_medium=referral&utm_campaign=partner"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded shadow transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-1.5 flex-shrink-0"
                  viewBox="0 0 64 64"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <ellipse cx="32" cy="34" rx="10" ry="13" />
                  <ellipse cx="32" cy="18" rx="7" ry="6" />
                  <ellipse cx="26" cy="15" rx="4" ry="3.5" opacity="0.85" />
                  <ellipse cx="38" cy="15" rx="4" ry="3.5" opacity="0.85" />
                  <ellipse
                    cx="16"
                    cy="28"
                    rx="11"
                    ry="5"
                    transform="rotate(-20 16 28)"
                    opacity="0.55"
                  />
                  <ellipse
                    cx="14"
                    cy="38"
                    rx="9"
                    ry="4"
                    transform="rotate(-15 14 38)"
                    opacity="0.4"
                  />
                  <ellipse
                    cx="48"
                    cy="28"
                    rx="11"
                    ry="5"
                    transform="rotate(20 48 28)"
                    opacity="0.55"
                  />
                  <ellipse
                    cx="50"
                    cy="38"
                    rx="9"
                    ry="4"
                    transform="rotate(15 50 38)"
                    opacity="0.4"
                  />
                  <line
                    x1="25"
                    y1="36"
                    x2="10"
                    y2="44"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="25"
                    y1="40"
                    x2="9"
                    y2="50"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="39"
                    y1="36"
                    x2="54"
                    y2="44"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="39"
                    y1="40"
                    x2="55"
                    y2="50"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                Check out BRUNDLE — part of the expanded JG universe!
              </a>

              <a
                href="https://jeffgoldblumle.printful.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 text-white text-xs font-bold rounded shadow hover:opacity-90 transition-opacity"
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Official Merchandise Store
              </a>

              <a
                href="https://x.com/jeffgoldblumle"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-500 via-zinc-600 to-gray-700 text-white text-xs font-bold rounded shadow hover:opacity-90 transition-opacity"
              >
                <svg
                  className="w-4 h-4 fill-current mr-1.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                Offical Twxttxr Account
              </a>
            </div>

            <a
              href="/association.html"
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline transition-colors pt-1"
            >
              Is this page associated with Jeff Goldblum?
            </a>

            <div className="flex flex-wrap justify-center gap-3 items-center pt-1">
              <a
                href="/about.html"
                className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-200 underline transition-colors"
              >
                About Us
              </a>
              <span className="text-gray-300 dark:text-gray-600 text-xs">
                ·
              </span>
              <a
                href="/facts.html"
                className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-200 underline transition-colors"
              >
                20 Jeff Goldblum Facts
              </a>
              <span className="text-gray-300 dark:text-gray-600 text-xs">
                ·
              </span>
              <a
                href="/quotes.html"
                className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-200 underline transition-colors"
              >
                His Greatest Quotes
              </a>
              <span className="text-gray-300 dark:text-gray-600 text-xs">
                ·
              </span>
              <a
                href="/movies.html"
                className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-200 underline transition-colors"
              >
                Best Movies, Ranked
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-2 items-center">
              <span className="text-sm font-medium dark:text-gray-300">
                Featured by:
              </span>
              <a
                href="https://www.instagram.com/reels/DYnVChDSerJ/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white text-xs font-bold rounded shadow hover:opacity-90 transition-opacity"
              >
                @samwitchx
              </a>
              <a
                href="https://www.instagram.com/reels/DXh1skLBGu_/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white text-xs font-bold rounded shadow hover:opacity-90 transition-opacity"
              >
                @swoop.douglas
              </a>
              <a
                href="https://www.youtube.com/shorts/wTM0BKI_B2s"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white text-xs font-bold rounded shadow hover:opacity-90 transition-opacity"
              >
                @Briank_fromtiktok
              </a>
              <a
                href="https://www.instagram.com/p/DZZONePxZNL/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white text-xs font-bold rounded shadow hover:opacity-90 transition-opacity"
              >
                @d34south
              </a>
              <a
                href="https://www.tiktok.com/@malachai1132/video/7649689310521871619"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white text-xs font-bold rounded shadow hover:opacity-90 transition-opacity"
              >
                @malachai1132
              </a>
              <a
                href="https://www.tiktok.com/@cerithdennis/video/7648439106694876438"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white text-xs font-bold rounded shadow hover:opacity-90 transition-opacity"
              >
                @cerithdennis
              </a>
            </div>
          </div>
        </div>

        <InfoModal
          isOpen={isInfoModalOpen}
          handleClose={() => setIsInfoModalOpen(false)}
        />
        <StatsModal
          isOpen={isStatsModalOpen}
          handleClose={() => setIsStatsModalOpen(false)}
          guesses={guesses}
          gameStats={stats}
          isGameLost={isGameLost}
          isGameWon={isGameWon}
          handleShareToClipboard={() => showSuccessAlert(GAME_COPIED_MESSAGE)}
          isHardMode={isHardMode}
          isDarkMode={isDarkMode}
          isHighContrastMode={isHighContrastMode}
          numberOfGuessesMade={guesses.length}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          handleClose={() => setIsSettingsModalOpen(false)}
          isHardMode={isHardMode}
          handleHardMode={handleHardMode}
          isDarkMode={isDarkMode}
          handleDarkMode={handleDarkMode}
          isHighContrastMode={isHighContrastMode}
          handleHighContrastMode={handleHighContrastMode}
        />
        <AlertContainer />
        <Analytics />
        <GoogleAdDisplay />
      </div>
    </div>
  )
}

export default App
