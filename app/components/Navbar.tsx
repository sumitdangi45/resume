import { Link, useLocation } from "react-router";
import { FileText, Github } from "lucide-react";

const Navbar = () => {
    const location = useLocation();
    
    const isActive = (path: string) => location.pathname === path;
    
    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg group-hover:shadow-lg transition-shadow">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                            RESUMIND
                        </p>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-4">
                        {/* Upload Resume Button */}
                        <Link
                            to="/upload"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                                isActive("/upload")
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-slate-700 hover:bg-blue-50"
                            }`}
                        >
                            <FileText className="w-5 h-5" />
                            <span className="hidden sm:inline">Upload Resume</span>
                            <span className="sm:hidden">Upload</span>
                        </Link>

                        {/* GitHub Analyzer Button */}
                        <Link
                            to="/github"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                                isActive("/github")
                                    ? "bg-slate-800 text-white shadow-lg"
                                    : "text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                            <Github className="w-5 h-5" />
                            <span className="hidden sm:inline">GitHub Analyzer</span>
                            <span className="sm:hidden">GitHub</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
