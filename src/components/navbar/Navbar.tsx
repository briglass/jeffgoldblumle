import {
  ChartBarIcon,
  CogIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline'
import { GAME_TITLE } from '../../constants/strings'

type Props = {
  setIsInfoModalOpen: (value: boolean) => void
  setIsStatsModalOpen: (value: boolean) => void
  setIsSettingsModalOpen: (value: boolean) => void
}

export const Navbar = ({
  setIsInfoModalOpen,
  setIsStatsModalOpen,
  setIsSettingsModalOpen,
}: Props) => {
  return (
    <div className="navbar">
      <div className="navbar-content px-5">
        <div className="flex">
          <ChartBarIcon
            className="h-6 w-6 mr-3 cursor-pointer dark:stroke-white"
            onClick={() => setIsStatsModalOpen(true)}
          />
          <CogIcon
            className="h-6 w-6 cursor-pointer dark:stroke-white"
            onClick={() => setIsSettingsModalOpen(true)}
          />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xl font-bold dark:text-white leading-none">{GAME_TITLE}</p>
          <a
            href="https://lolword.com?utm_source=jeffgoldblumle&utm_medium=referral&utm_campaign=partner"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] md:text-[10px] font-extrabold px-1.5 py-0.5 bg-gradient-to-r from-lime-400 via-lime-300 to-yellow-300 text-black border border-black rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 uppercase tracking-wider mt-1"
          >
            CHECK OUT LOLWORD.COM FOR MORE
          </a>
        </div>
        <div className="right-icons">
          <InformationCircleIcon
            className="h-6 w-6 cursor-pointer dark:stroke-white"
            onClick={() => setIsInfoModalOpen(true)}
          />
        </div>
      </div>
      <hr></hr>
    </div>
  )
}
