export const GutterwireBanner = () => {
  return (
    <div className="flex justify-center mt-3 mb-1 px-2 w-full max-w-lg mx-auto">
      <a
        href="https://www.gutterwire.com/?utm_source=jeffgoldblumle.com&utm_medium=banner&utm_campaign=jeffgoldblumle"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-900 via-zinc-800 to-slate-900 text-white rounded-lg shadow-md hover:shadow-lg hover:from-black hover:to-zinc-900 border border-zinc-700 transition-all duration-200 group text-center sm:text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full justify-between">
          <span className="text-xs sm:text-sm font-bold tracking-wide text-gray-100 group-hover:text-white">
            <span className="font-extrabold text-red-500 uppercase tracking-wider mr-1.5">
              GUTTERWIRE:
            </span>
            <span>Get news without getting dirty</span>
          </span>
          <span className="inline-flex items-center text-[10px] sm:text-xs font-semibold text-red-400 group-hover:text-red-300 transition-colors self-end sm:self-auto">
            Visit site &rarr;
          </span>
        </div>
      </a>
    </div>
  )
}
