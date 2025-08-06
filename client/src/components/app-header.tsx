import { GraduationCap, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-6 w-6" />
            <h1 className="text-xl font-medium">GermanPro</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#practice" className="hover:text-blue-200 transition-colors">
              Practice
            </a>
            <a href="#progress" className="hover:text-blue-200 transition-colors">
              Progress
            </a>
            <a href="#levels" className="hover:text-blue-200 transition-colors">
              Levels
            </a>
          </nav>
          <Button variant="ghost" size="sm" className="md:hidden text-white hover:text-white hover:bg-blue-600">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
