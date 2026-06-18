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
      <div className="pt-0.5 px-1 pb-8 md:max-w-7xl w-full mx-auto sm:px-6 lg:px-8 flex flex-col grow">
        <div className="grow flex flex-col justify-center">
          <div className="mb-2">
            <Alert
              isOpen={isVisible && status === 'success'}
              message={message || ''}
              variant="success"
              inline={true}
            />
          </div>

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

          <div className="pt-4 pb-3 flex flex-col items-center justify-center space-y-3">
            <div className="max-w-md mx-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-md text-center text-xs text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-200 shadow-sm">
              <span className="font-semibold block mb-1">⚠️ Notice</span>
              We are aware some users are experiencing intrusive popup ads, and
              appreciate your patience as we work with our hosting service to
              eliminate these!
            </div>

            <a
              href="https://brundle.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded shadow transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2 flex-shrink-0"
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

            <div className="flex flex-wrap justify-center gap-3 items-center">
              <a
                href="https://www.buymeacoffee.com/briglass314"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-700 via-amber-800 to-yellow-900 text-white text-xs font-bold rounded shadow hover:opacity-90 transition-opacity"
              >
                <svg
                  className="w-4 h-4 fill-current mr-1.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.216 6.415l-.132-.013c-.347-.008-.636-.283-.642-.63l-.012-.952c-.006-.411-.329-.715-.71-.715H3.666c-.38 0-.703.304-.71.715l-.012.952c-.006.347-.295.622-.642.63l-.132.013c-1.144.112-1.921 1.115-1.921 2.274v1.5c0 1.95 1.545 3.528 3.486 3.568l.012.952c.006.347.295.622.642.63l.132.013c.895.088 1.58.749 1.58 1.654v.373c0 .825-.66 1.488-1.485 1.488h-.3c-.825 0-1.5.675-1.5 1.5s.675 1.5 1.5 1.5h14c.825 0 1.5-.675 1.5-1.5s-.675-1.5-1.5-1.5h-.3c-.825 0-1.485-.663-1.485-1.488v-.373c0-.905.685-1.566 1.58-1.654l.132-.013c.347-.008.636-.283.642-.63l.012-.952h.1c1.103 0 2 .897 2 2v1.5z" />
                </svg>
                Buy me a coffee
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

            {/* <a
              href="https://omg10.com/4/11121017"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-600 text-white text-sm font-bold rounded shadow hover:opacity-90 transition-opacity"
            >
              Check out our sponsor
            </a> */}
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
      </div>
    </div>
  )
}

export default App
