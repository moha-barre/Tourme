import { Link } from "react-router";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-2 mt-4   rounded-xl bg-black/60 backdrop-blur-md border border-gray-800 shadow-md container  w-full">
      <p className="font-extrabold cursor-pointer text-gradient text-2xl tracking-tight select-none">
        Tourme
      </p>
      <div className="flex gap-6 md:gap-10">
        <Link to="/" className="px-4 py-1 rounded-md hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-400 hover:text-black transition-colors font-medium">Home</Link>
        <Link to="/about" className="px-4 py-1 rounded-md hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-400 hover:text-black transition-colors font-medium">About</Link>
        <Link to="/contact" className="px-4 py-1 rounded-md hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-400 hover:text-black transition-colors font-medium">Contact</Link>
      </div>
    </nav>
  );
};

export default Navbar;