import { AppProvider, useApp } from "./context/AppContext";
import { useEffect } from "react";
import Header from "./components/Header";
import HomePage from "./components/HomePage";

import TravelHome from "./modules/travel/TravelHome";
import TravelFlights from "./modules/travel/TravelFlights";
import TravelDetails from "./modules/travel/TravelDetails";
import TravelBooking from "./modules/travel/TravelBooking";
import TravelPayment from "./modules/travel/TravelPayment";
import TravelConfirmation from "./modules/travel/TravelConfirmation";
import TravelHotels from "./modules/travel/TravelHotels";
import TravelBuses from "./modules/travel/TravelBuses";
import TravelSeats from "./modules/travel/TravelSeats";
import TravelTrains from "./modules/travel/TravelTrains";
import TravelMetro from "./modules/travel/TravelMetro";
import TravelMetroDetails from "./modules/travel/TravelMetroDetails";

import FoodHome from "./modules/food/FoodHome";
import FoodMenu from "./modules/food/FoodMenu";
import FoodCart from "./modules/food/FoodCart";
import FoodPayment from "./modules/food/FoodPayment";
import FoodTracking from "./modules/food/FoodTracking";

import WalletHome from "./modules/wallet/WalletHome";
import Offers from "./modules/wallet/Offers";
import WalletTransactions from "./modules/wallet/WalletTransactions";

import TicketsHome from "./modules/tickets/TicketsHome";
import TicketsDetails from "./modules/tickets/TicketsDetails";
import TicketsSeats from "./modules/tickets/TicketsSeats";
import TicketsPayment from "./modules/tickets/TicketsPayment";
import TicketsConfirmation from "./modules/tickets/TicketsConfirmation";

import ShoppingHome from "./modules/shopping/ShoppingHome";
import ShoppingSearch from "./modules/shopping/ShoppingSearch";
import ShoppingDetails from "./modules/shopping/ShoppingDetails";
import ShoppingCart from "./modules/shopping/ShoppingCart";
import ShoppingPayment from "./modules/shopping/ShoppingPayment";
import ShoppingTracking from "./modules/shopping/ShoppingTracking";
import ShoppingCategory from "./modules/shopping/ShoppingCategory";

import Footer from "./components/Footer";
import SiteFooter from "./components/SiteFooter";
import InstallPrompt from "./components/InstallPrompt";
import Toast from "./components/Toast";
import Confetti from "./components/Confetti";
import About from "./components/static/About";
import Careers from "./components/static/Careers";
import Press from "./components/static/Press";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import OrdersPage from "./components/OrdersPage";
import OpenOnPhone from "./components/OpenOnPhone";
import ManageAddresses from "./components/ManageAddresses";
import PaymentMethods from "./components/PaymentMethods";
import PrivacySecurity from "./components/PrivacySecurity";
import HelpCenter from "./components/HelpCenter";
import TermsConditions from "./components/TermsConditions";
import PrivacyPolicy from "./components/PrivacyPolicy";
import NotificationsInbox from "./components/NotificationsInbox";
import RecentlyViewedPage from "./components/RecentlyViewedPage";
import Wishlist from "./components/Wishlist";
import SupportFab from "./components/SupportFab";
import ChatBot from "./components/ChatBot";
import ScrollProgress from "./components/ScrollProgress";

function AppContent() {
  const { currentPage, setCurrentPage } = useApp();

  // lightweight bus: when wallet module emits 'offers-open', navigate to offers page
  useEffect(() => {
    const handler = () => setCurrentPage("wallet-offers");
    window.addEventListener("offers-open", handler as EventListener);
    return () =>
      window.removeEventListener("offers-open", handler as EventListener);
  }, [setCurrentPage]);

  // navigate to terms with anchor when requested
  useEffect(() => {
    const handler = () => {
      const target = localStorage.getItem("navigateTo");
      if (target && target.startsWith("terms")) {
        setCurrentPage("terms");
        setTimeout(() => {
          const id = target.split("#")[1];
          if (id)
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
          localStorage.removeItem("navigateTo");
        }, 50);
      }
    };
    window.addEventListener("nav-anchor", handler);
    return () => window.removeEventListener("nav-anchor", handler);
  }, [setCurrentPage]);

  // Ensure initial product list is available for shopping search/details
  if (!localStorage.getItem("allProducts")) {
    try {
      const defaultProducts = [
        {
          id: "1",
          name: "Apple iPhone 15 Pro",
          category: "Electronics",
          price: 129900,
          image:
            "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600",
          description:
            "Latest Apple iPhone with A17 chip, Pro camera and Dynamic Island",
        },
        {
          id: "2",
          name: "Sony WH-1000XM5 Headphones",
          category: "Audio",
          price: 29990,
          image:
            "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600",
          description: "Industry-leading noise cancellation with premium sound",
        },
        {
          id: "3",
          name: "Nike Air Max Sneakers",
          category: "Fashion",
          price: 8999,
          image:
            "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600",
          description: "Comfortable running shoes with responsive cushioning",
        },
        {
          id: "4",
          name: 'Samsung 55" 4K Smart TV',
          category: "Electronics",
          price: 54990,
          image:
            "https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=600",
          description: "Ultra HD display with HDR10+ and smart apps",
        },
        {
          id: "5",
          name: "Levi's Denim Jacket",
          category: "Fashion",
          price: 3499,
          image:
            "https://images.pexels.com/photos/1058959/pexels-photo-1058959.jpeg?auto=compress&cs=tinysrgb&w=600",
          description: "Classic denim jacket with a modern fit",
        },
        {
          id: "6",
          name: "Apple MacBook Air M2",
          category: "Computers",
          price: 119900,
          image:
            "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600",
          description:
            "Lightweight laptop with M2 performance and long battery life",
        },
      ];
      localStorage.setItem("allProducts", JSON.stringify(defaultProducts));
    } catch {
      // ignore
    }
  }

  // Seed restaurants for food search/global search
  if (!localStorage.getItem("allRestaurants")) {
    try {
      const defaultRestaurants = [
        {
          id: "1",
          name: "Punjabi Dhaba",
          cuisine: "North Indian",
          image:
            "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=600",
        },
        {
          id: "2",
          name: "Pizza Hub",
          cuisine: "Italian, Fast Food",
          image:
            "https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=600",
        },
        {
          id: "3",
          name: "South Spice",
          cuisine: "South Indian",
          image:
            "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=600",
        },
      ];
      localStorage.setItem(
        "allRestaurants",
        JSON.stringify(defaultRestaurants)
      );
    } catch {
      /* ignore */
    }
  }

  // Seed movies for tickets search/global search
  if (!localStorage.getItem("allMovies")) {
    try {
      const defaultMovies = [
        {
          id: "1",
          title: "Avengers: Secret Wars",
          image:
            "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=600",
        },
        {
          id: "2",
          title: "The Dark Knight Returns",
          image:
            "https://images.pexels.com/photos/7991319/pexels-photo-7991319.jpeg?auto=compress&cs=tinysrgb&w=600",
        },
        {
          id: "3",
          title: "Inception 2",
          image:
            "https://images.pexels.com/photos/436413/pexels-photo-436413.jpeg?auto=compress&cs=tinysrgb&w=600",
        },
      ];
      localStorage.setItem("allMovies", JSON.stringify(defaultMovies));
    } catch {
      /* ignore */
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;

      case "travel-home":
        return <TravelHome />;
      case "travel-results":
        return <TravelFlights />;
      case "travel-hotels":
        return <TravelHotels />;
      case "travel-buses":
        return <TravelBuses />;
      case "travel-trains":
        return <TravelTrains />;
      case "travel-metro":
        return <TravelMetro />;
      case "travel-metro-details":
        return <TravelMetroDetails />;
      case "travel-details":
        return <TravelDetails />;
      case "travel-seats":
        return <TravelSeats />;
      case "travel-booking":
        return <TravelBooking />;
      case "travel-payment":
        return <TravelPayment />;
      case "travel-confirmation":
        return <TravelConfirmation />;

      case "food-home":
        return <FoodHome />;
      case "food-menu":
        return <FoodMenu />;
      case "food-cart":
        return <FoodCart />;
      case "food-payment":
        return <FoodPayment />;
      case "food-tracking":
        return <FoodTracking />;

      case "wallet-home":
        return <WalletHome />;
      case "wallet-offers":
        return <Offers />;
      case "wallet-transactions":
        return <WalletTransactions />;

      case "tickets-home":
        return <TicketsHome />;
      case "tickets-details":
        return <TicketsDetails />;
      case "tickets-seats":
        return <TicketsSeats />;
      case "tickets-payment":
        return <TicketsPayment />;
      case "tickets-confirmation":
        return <TicketsConfirmation />;

      case "login":
        return <Login />;
      case "signup":
        return <Signup />;
      case "profile":
        return <Profile />;
      case "edit-profile":
        return <EditProfile />;
      case "orders":
        return <OrdersPage />;
      case "open-on-phone":
        return <OpenOnPhone />;
      case "manage-addresses":
        return <ManageAddresses />;
      case "payment-methods":
        return <PaymentMethods />;
      case "privacy-security":
        return <PrivacySecurity />;
      case "help-center":
        return <HelpCenter />;
      case "terms":
        return <TermsConditions />;
      case "privacy-policy":
        return <PrivacyPolicy />;
      case "notifications":
        return <NotificationsInbox />;
      case "wishlist":
        return <Wishlist />;
      case "recently-viewed":
        return <RecentlyViewedPage />;
      case "about":
        return <About />;
      case "careers":
        return <Careers />;
      case "press":
        return <Press />;

      case "shopping-home":
        return <ShoppingHome />;
      case "shopping-search":
        return <ShoppingSearch />;
      case "shopping-category":
        return <ShoppingCategory />;
      case "shopping-details":
        return <ShoppingDetails />;
      case "shopping-cart":
        return <ShoppingCart />;
      case "shopping-payment":
        return <ShoppingPayment />;
      case "shopping-tracking":
        return <ShoppingTracking />;

      default:
        return <HomePage />;
    }
  };

  return (
    <>
      <Header />
      <ScrollProgress />
      <div key={currentPage} className="page-enter">
        {renderPage()}
      </div>
      <ChatBot />
      <SupportFab />
      <Toast />
      <Confetti />
      <Footer />
      <SiteFooter />
      <InstallPrompt />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
