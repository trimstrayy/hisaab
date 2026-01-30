import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Wallet, FileText, Menu, X, Milk } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/', label: 'दैनिक प्रविष्टि', labelEn: 'Daily Entry', icon: LayoutDashboard },
  { to: '/farmers', label: 'किसान', labelEn: 'Farmers', icon: Users },
  { to: '/advances', label: 'अग्रिम', labelEn: 'Advances', icon: Wallet },
  { to: '/report', label: 'विवरण', labelEn: 'Report', icon: FileText },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-primary text-primary-foreground shadow-md print:hidden">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
              <Milk className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold md:text-xl">Panchamrit Suppliers</h1>
              <p className="text-xs opacity-80">Banepa-9, Kavre</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  location.pathname === item.to
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-primary-foreground/10'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.labelEn}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-primary-foreground/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-primary-foreground/20 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                  location.pathname === item.to
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-primary-foreground/10'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.labelEn}</span>
                <span className="text-xs opacity-70">({item.label})</span>
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
