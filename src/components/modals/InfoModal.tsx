import { Cell } from '../grid/Cell'
import { BaseModal } from './BaseModal'

type Props = {
  isOpen: boolean
  handleClose: () => void
}

export const InfoModal = ({ isOpen, handleClose }: Props) => {
  return (
    <BaseModal title="How to play" isOpen={isOpen} handleClose={handleClose}>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        Guess the word in 3 tries. After each guess, the color of the tiles will
        change to show how close your guess was to the word. Green means the right letter is in the right spot. Yellow means the letter is in the word, but not in the right spot. 90% of the time, the answer is Jeff Goldblum. 10% of the time, the answer is not Jeff Goldblum.
      </p>

      <div className="flex justify-center mb-1 mt-4">
        <Cell
          isRevealing={true}
          isCompleted={true}
          value="J"
          status="correct"
        />
           <Cell
          isRevealing={true}
          isCompleted={true}
          value="E"
          status="correct"
        />
           <Cell
          isRevealing={true}
          isCompleted={true}
          value="F"
          status="correct"
        />
            <Cell
          isRevealing={true}
          isCompleted={true}
          value="F"
          status="correct"
        />
            <Cell
          isRevealing={true}
          isCompleted={true}
          value="G"
          status="correct"
        />        
            <Cell
          isRevealing={true}
          isCompleted={true}
          value="O"
          status="correct"
        />
            <Cell
          isRevealing={true}
          isCompleted={true}
          value="L"
          status="correct"
        />
            <Cell
          isRevealing={true}
          isCompleted={true}
          value="D"
          status="correct"
        />
            <Cell
          isRevealing={true}
          isCompleted={true}
          value="B"
          status="correct"
        />
            <Cell
          isRevealing={true}
          isCompleted={true}
          value="L"
          status="correct"
        />        
            <Cell
          isRevealing={true}
          isCompleted={true}
          value="U"
          status="correct"
        />
            <Cell
          isRevealing={true}
          isCompleted={true}
          value="M"
          status="correct"
        />
      </div>
    
      <p className="mt-6 italic text-sm text-gray-500 dark:text-gray-300">
        This is an open source version of the word guessing game we all know and
        love -{' '}
        <a
          href="https://github.com/cwackerfuss/react-wordle"
          className="underline font-bold"
        >
          check out the code here
        </a>{' '}
      </p>
    </BaseModal>
  )
}
