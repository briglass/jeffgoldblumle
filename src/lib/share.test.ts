import { generateEmojiGrid } from './share'

jest.mock('./words', () => {
  let mockSolution = 'ABCDE'
  return {
    ...jest.requireActual('./words'),
    get solution() {
      return mockSolution
    },
    setMockSolution: (s: string) => {
      mockSolution = s
    },
  }
})

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { setMockSolution } = require('./words')

describe('generateEmojiGrid', () => {
  test('generates grid for ascii', () => {
    const guesses = ['EDCBA', 'VWXYZ', 'ABCDE']
    const tiles = ['C', 'P', 'A'] // Correct, Present, Absemt
    setMockSolution('ABCDE')

    const grid = generateEmojiGrid(guesses, tiles)
    const gridParts = grid.split('\n')
    expect(gridParts[0]).toBe('PPCPP')
    expect(gridParts[1]).toBe('AAAAA')
    expect(gridParts[2]).toBe('CCCCC')
  })
  test('generates grid for emoji', () => {
    const guesses = ['5️⃣4️⃣3️⃣2️⃣1️⃣', '♠️♥️♦️♣️🔔', '1️⃣2️⃣3️⃣4️⃣5️⃣']
    const tiles = ['C', 'P', 'A'] // Correct, Present, Absemt
    setMockSolution('1️⃣2️⃣3️⃣4️⃣5️⃣')

    const grid = generateEmojiGrid(guesses, tiles)
    const gridParts = grid.split('\n')
    expect(gridParts[0]).toBe('PPCPP')
    expect(gridParts[1]).toBe('AAAAA')
    expect(gridParts[2]).toBe('CCCCC')
  })
})
