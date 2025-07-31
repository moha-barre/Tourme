import React from "react";

interface TourCardProps {
  imageUrl: string;
  name: string;
  description: string;
  type: string;
  playersCount: number;
  status: string; // e.g., "Starts in 3 Days", "Ongoing"
  onJoin: () => void;
  onView: () => void;
}

const typeColors: Record<string, string> = {
  Football: "bg-blue-100 text-blue-800",
  Chess: "bg-gray-100 text-gray-800",
  eSports: "bg-purple-100 text-purple-800",
  // Add more types as needed
};

const TourCard: React.FC<TourCardProps> = ({
  imageUrl,
  name,
  description,
  type,
  playersCount,
  status,
  onJoin,
  onView,
}) => {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 max-w-sm w-full flex flex-col overflow-hidden transition-shadow hover:shadow-xl">
      <div className="relative">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-40 object-cover rounded-t-2xl border-b border-gray-200 dark:border-gray-800 shadow-sm"
        />
        <span
          className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${typeColors[type] || "bg-gray-100 text-gray-800"}`}
        >
          {type}
        </span>
        <span className="absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full bg-gray-900/80 text-white dark:bg-gray-700/80">
          {status}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-5 flex-1">
        <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white mb-1 truncate">
          {name}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-2 min-h-[48px]">
          {description}
        </p>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm mb-4">
          <span className="inline-flex items-center gap-1">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m10-5a4 4 0 11-8 0 4 4 0 018 0zm-8 0a4 4 0 11-8 0 4 4 0 018 0zm8 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            {playersCount} Players
          </span>
        </div>
        <div className="flex gap-2 mt-auto">
          <button
            className="primary-button flex items-center gap-1 font-semibold text-sm shadow hover:bg-blue-600 transition-colors px-5 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={onJoin}
          >
            Join
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
          <button
            className="flex items-center gap-1 font-medium text-sm px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={onView}
          >
            <span>View</span>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5-9 9-9 9s-9-4-9-9a9 9 0 0118 0z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourCard;