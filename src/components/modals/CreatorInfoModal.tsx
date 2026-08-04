import { BaseModal } from './BaseModal'

type Props = {
  isOpen: boolean
  handleClose: () => void
}

export const CreatorInfoModal = ({ isOpen, handleClose }: Props) => {
  return (
    <BaseModal
      title="Ad-Free for Content Creators"
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <div className="mt-2 space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-300">
          Are you a content creator? Post a video of yourself playing
          JEFFGOLDBLUMLE — TikTok, Instagram, YouTube, wherever — and if we spot
          it, we&rsquo;ll reach out and set you up with ad-free access,
          completely free.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          No forms, no sign-ups. Just play, post, and keep an eye on your DMs.
        </p>
      </div>
    </BaseModal>
  )
}
