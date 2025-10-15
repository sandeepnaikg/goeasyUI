import { Home, Plane, UtensilsCrossed, ShoppingBag, Ticket } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { currentPage, setCurrentPage, setCurrentModule } = useApp();

  type ModuleType = 'travel' | 'food' | 'tickets' | 'shopping' | null;

  const handleNavigation = (page: string, module: ModuleType) => {
    setCurrentPage(page);
    setCurrentModule(module);
  };

  const navItems: {
    id: string;
    icon: React.ElementType;
    label: string;
    page: string;
    module: ModuleType;
  }[] = [
    { id: 'home', icon: Home, label: 'Home', page: 'home', module: null },
    { id: 'travel', icon: Plane, label: 'Travel', page: 'travel-home', module: 'travel' },
    { id: 'food', icon: UtensilsCrossed, label: 'Food', page: 'food-home', module: 'food' },
    { id: 'tickets', icon: Ticket, label: 'Tickets', page: 'tickets-home', module: 'tickets' },
    { id: 'shopping', icon: ShoppingBag, label: 'Shopping', page: 'shopping-home', module: 'shopping' },
  ];

  const getActiveModule = () => {
    if (currentPage === 'home') return 'home';
    if (currentPage.startsWith('travel')) return 'travel';
    if (currentPage.startsWith('food')) return 'food';
    if (currentPage.startsWith('tickets')) return 'tickets';
    if (currentPage.startsWith('shopping')) return 'shopping';
    return 'home';
  };

  const activeModule = getActiveModule();

  return (
    <footer className="fixed md:hidden bottom-0 left-0 right-0 bg-gradient-to-r from-[#0A1D5E] to-[#182B8F] shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.page, item.module)}
                className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-white bg-white/20'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
