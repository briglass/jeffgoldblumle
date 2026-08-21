export const GutterwireBanner = () => {
  return (
    <div className="flex justify-center mt-3 mb-1 px-2 w-full max-w-lg mx-auto">
      <a
        href="https://www.gutterwire.com/?utm_source=jeffgoldblumle.com&utm_medium=banner&utm_campaign=jeffgoldblumle"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-between px-4 py-2.5 bg-black hover:bg-zinc-900 text-white rounded-lg shadow-md border border-zinc-700 transition-all duration-200 group text-center sm:text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 w-full justify-between">
          <span className="text-xs sm:text-sm font-medium tracking-wide text-zinc-200 group-hover:text-white flex items-center flex-wrap gap-1.5">
            <span className="font-oswald font-bold text-base sm:text-lg tracking-wider text-white uppercase">
              GUTTERWIRE:
            </span>
            <span>Get news without getting dirty</span>
          </span>
          <span className="inline-flex items-center text-[10px] sm:text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors self-end sm:self-auto uppercase tracking-wide">
            Visit site &rarr;
          </span>
        </div>
      </a>
    </div>
  )
}

