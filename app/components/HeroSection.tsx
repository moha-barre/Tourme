


const HeroSection = () => {
  return (
    <section className="flex flex-col items-center justify-center  bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white px-4 mt-2 container h-screen">
    <div className="lex flex-col items-center justify-center ">
        
      <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg text-center">
        Host. Compete. Triumph.<br />
        <span className="text-gradient bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">Unleash the Champion Within</span>
      </h1>
    
      <p className="text-md md:text-lg mb-8 text-gray-400 text-center max-w-xl">
        Discover new competitions, connect with passionate players, and rise through the ranks. Your journey to glory begins now!
      </p>
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-4">
        <button className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
          Create Tournament
        </button>
        <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-lg shadow-md hover:from-pink-600 hover:to-purple-600 transition-colors">
          Find Tournaments
        </button>
      </div>
      
    </div>
      
    </section>
  );
};

export default HeroSection;