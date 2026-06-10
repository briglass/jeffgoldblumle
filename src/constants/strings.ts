export const GAME_TITLE = process.env.REACT_APP_GAME_NAME!

export const WIN_MESSAGES = [
  'Life finds a way.',
  'Nice To Meet You, Mr. Dude.',
  'God creates dinosaurs, God destroys dinosaurs, God creates man, man destroys God, man creates dinosaurs',
  'Did He Just Throw My Cat Out Of The Window?',
  'Must Go Faster',
  'Help Me. Help Me Be Human',
  'He Wasnt The President Yet',
  'What Am I Working On?',
  'Checkmate.',
  'I am a scientist.',
  'Be afraid. Be very afraid',
  'Time travels in both directions',
  'How do you do, fellow primates?',
  'It`s a tie.',
  'I am becoming something that has never existed before',
  'History is happening now, and we are part of it',
  'I don`t think I`m constructed for this',
  'Revolution? Where is the Revolution? I don`t see any Revolution',
  'You`re a wizard, Harry... wait, wrong movie',
  'Yeah, but your scientists were so preoccupied with whether or not they could, they didn`t stop to think if they should'
]
export const GAME_COPIED_MESSAGE = 'Game copied to clipboard'
export const NOT_ENOUGH_LETTERS_MESSAGE = 'Not enough letters'
export const WORD_NOT_FOUND_MESSAGE = 'Word not found'
export const HARD_MODE_ALERT_MESSAGE =
  'Hard Mode can only be enabled at the start!'
export const HARD_MODE_DESCRIPTION =
  'Any revealed hints must be used in subsequent guesses'
export const HIGH_CONTRAST_MODE_DESCRIPTION = 'For improved color vision'
export const CORRECT_WORD_MESSAGE = (solution: string) =>
  `The word was ${solution}`
export const WRONG_SPOT_MESSAGE = (guess: string, position: number) =>
  `Must use ${guess} in position ${position}`
export const NOT_CONTAINED_MESSAGE = (letter: string) =>
  `Guess must contain ${letter}`
export const ENTER_TEXT = 'Enter'
export const DELETE_TEXT = 'Delete'
export const STATISTICS_TITLE = 'Statistics'
export const GUESS_DISTRIBUTION_TEXT = 'Guess Distribution'
export const NEW_WORD_TEXT = 'New word in'
export const SHARE_TEXT = 'Share'
export const TOTAL_TRIES_TEXT = 'Total tries'
export const SUCCESS_RATE_TEXT = 'Success rate'
export const CURRENT_STREAK_TEXT = 'Current streak'
export const BEST_STREAK_TEXT = 'Best streak'
