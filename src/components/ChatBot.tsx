import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X, Send, Globe, Plane, Utensils, ShoppingBag, Ticket, Wallet as WalletIcon, Gift, HelpCircle, Mic, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

type Lang = 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'as' | 'bn' | 'brx' | 'doi' | 'gu' | 'ks' | 'kok' | 'mai' | 'ml' | 'mni' | 'mr' | 'ne' | 'or' | 'pa' | 'sa' | 'sat' | 'sd' | 'ur';
type ChatMsg = { id: string; role: 'bot' | 'user'; text: string };

// Minimal typings for Web Speech API to keep TS happy without depending on lib updates
type SpeechRecognitionEventLike = { results: { [index: number]: { [index: number]: { transcript: string } } } };
type WebSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (e: SpeechRecognitionEventLike) => void;
  onerror: (e?: unknown) => void;
  start: () => void;
};

const greetings: Record<Lang, string> = {
  en: 'Hi! I am Gozy Assistant. Choose a language to continue:',
  hi: 'नमस्ते! मैं गोज़ी असिस्टेंट हूं। आगे बढ़ने के लिए भाषा चुनें:',
  kn: 'ನಮಸ್ಕಾರ! ನಾನು ಗೋಜಿ ಸಹಾಯಕರಾಗಿದ್ದೇನೆ. ಮುಂದುವರಿಸಲು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:',
  te: 'నమస్తే! నేను గోజీ అసిస్టెంట్. కొనసాగడానికి భాషని ఎంచుకోండి:',
  ta: 'வணக்கம்! நான் கோஸி உதவியாளர். தொடர மொழியைத் தேர்ந்தெடுக்கவும்:',
  as: 'নমস্কাৰ! মই গ’জি সহায়ক। আগবাঢ়িবলৈ ভাষা বাছনি কৰক:',
  bn: 'নমস্কার! আমি গোজি অ্যাসিস্ট্যান্ট। ভাষা নির্বাচন করুন:',
  brx: 'खौ गोज़ी असिस्टेन्टआव। रानो खोन्दो फोजोना दं:',
  doi: 'नमस्कार! मैं गोजी असिस्टेंट हां। भाषा चुनो:',
  gu: 'નમસ્તે! હું ગોઝી અસિસ્ટન્ટ છું. આગળ વધવા ભાષા પસંદ કરો:',
  ks: 'آداب! بيوس گوزی اسسٹنٹ چھُ۔ ژٲنۍ ژٲب پسند کٲمژ:',
  kok: 'नमस्कार! हांव Gozy Assistant. आगें वचपाक भाषा वेंचात:',
  mai: 'नमस्कार! हम गोजी असिस्टेंट छी. भाषा चुनू:',
  ml: 'നമസ്കാരം! ഞാൻ ഗോസീ അസിസ്റ്റന്റ്. ഭാഷ തിരഞ്ഞെടുക്കൂ:',
  mni: 'ꯅꯨ ꯍꯥꯏ! ꯑꯁꯤ Gozy Assistant ꯑꯃ. ꯂꯣꯄ ꯂꯣꯡ ꯑꯗꯨ:',
  mr: 'नमस्कार! मी गोझी असिस्टंट आहे. पुढे जाण्यासाठी भाषा निवडा:',
  ne: 'नमस्कार! म गोजी सहायक हुँ। भाषा छान्नुहोस्:',
  or: 'ନମସ୍କାର! ମୁଁ ଗୋଜି ଆସିଷ୍ଟାଣ୍ଟ। ଭାଷା ବାଛନ୍ତୁ:',
  pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਗੋਜ਼ੀ ਅਸਿਸਟੈਂਟ ਹਾਂ। ਭਾਸ਼ਾ ਚੁਣੋ:',
  sa: 'नमः! अहं गोज़ी साहाय्यकः अस्मि। भाषां वृत्यताम्:',
  sat: 'Johar! men Gozy Assistant men. hor hopon men:',
  sd: 'اسلام عليڪم! مان گوزي اسسٽنٽ آهیان. ٻولي چونڊيو:',
  ur: 'السلام علیکم! میں گوزی اسسٹنٹ ہوں۔ زبان منتخب کریں:'
};

const overview: Record<Lang, string> = {
  en: 'Here’s a quick overview: Travel for flights, trains, buses, and hotels. Food for ordering from restaurants. Shopping for products and deals. Tickets for movies and events. Wallet for balance, vouchers, and offers.',
  hi: 'त्वरित जानकारी: ट्रैवल में फ्लाइट्स, ट्रेन, बस और होटल. फूड में रेस्तरां से ऑर्डर. शॉपिंग में प्रोडक्ट्स और ऑफ़र. टिकट्स में मूवीज़ और इवेंट्स. वॉलेट में बैलेंस, वाउचर और ऑफ़र.',
  kn: 'ಸಂಕ್ಷಿಪ್ತವಾಗಿ: ಟ್ರಾವೆಲ್‌ನಲ್ಲಿ ವಿಮಾನ, ರೈಲು, ಬಸ್ ಮತ್ತು ಹೋಟೆಲ್. ಫೂಡ್‌ನಲ್ಲಿ ಊಟ ಆರ್ಡರ್. ಶಾಪಿಂಗ್‌ನಲ್ಲಿ ಉತ್ಪನ್ನಗಳು ಮತ್ತು ಡೀಲ್‌ಗಳು. ಟಿಕೆಟ್‌ನಲ್ಲಿ ಚಿತ್ರಗಳು ಮತ್ತು ಈವೆಂಟ್‌ಗಳು. ವಾಲೆಟ್‌ನಲ್ಲಿ ಬ್ಯಾಲೆನ್ಸ್ ಮತ್ತು ಆಫರ್‌ಗಳು.',
  te: 'సంక్షిప్తంగా: ట్రావెల్‌లో ఫ్లైట్స్, ట్రైన్స్, బస్సులు, హోటల్స్. ఫుడ్‌లో రెస్టారెంట్ ఆర్డర్లు. షాపింగ్‌లో ప్రొడక్ట్స్, డీల్స్. టికెట్స్‌లో మూవీస్, ఈవెంట్స్. వాలెట్‌లో బ్యాలెన్స్, వోచర్స్, ఆఫర్లు.',
  ta: 'சுருக்கமாக: டிராவலில் விமானம், ரயில், பஸ், ஹோட்டல்ஸ். உணவில் ரெஸ்டாரண்ட் ஆர்டர். ஷாப்பிங்கில் பொருட்கள், சலுகைகள். டிக்கெட்ஸ்‌లో படங்கள், நிகழ்வுகள். வாலெட்டில் இருப்பு, வவுச்சர், ஆஃபர்கள்.',
  as: '', bn: '', brx: '', doi: '', gu: '', ks: '', kok: '', mai: '', ml: '', mni: '', mr: '', ne: '', or: '', pa: '', sa: '', sat: '', sd: '', ur: ''
};

export default function ChatBot() {
  const { setCurrentModule, setCurrentPage, currentPage } = useApp();
  const [open, setOpen] = useState<boolean>(() => {
    try { return localStorage.getItem('chatbotOpen') === '1'; } catch { return false; }
  });
  const [lang, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem('chatbotLang') as Lang) || 'en'; } catch { return 'en'; }
  });
  const [messages, setMessages] = useState<ChatMsg[]>(() => [
    { id: 'm1', role: 'bot', text: greetings['en'] },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [recents, setRecents] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('chatRecents') || '[]'); } catch { return []; }
  });
  const [showMenu, setShowMenu] = useState(false);
  const [showLangPrompt, setShowLangPrompt] = useState<boolean>(() => {
    try { return !localStorage.getItem('chatbotLang'); } catch { return true; }
  });
  type FlightFlow = { type: 'flight'; step: 'from'|'to'|'date'; from?: string; to?: string; date?: string } | null;
  const [flow, setFlow] = useState<FlightFlow>(null);
  const gifUrl = useMemo(() => {
    try {
      const stored = localStorage.getItem('chatbotGifUrl');
      if (stored) return stored;
      const hour = new Date().getHours();
      // Prefer pink as default since it's present; switch to blue during day if set later
      return (hour >= 7 && hour < 18) ? '/chatbot-pink.gif' : '/chatbot-pink.gif';
    } catch {
      return '/chatbot-pink.gif';
    }
  }, []);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) try { localStorage.setItem('chatbotOpen','1'); } catch { /* ignore */ }
    else try { localStorage.removeItem('chatbotOpen'); } catch { /* ignore */ }
    if (open) {
      // Let other widgets know chat was opened (to reveal Help FAB on left)
      try { localStorage.setItem('helpFabVisible','1'); } catch { /* ignore */ }
      window.dispatchEvent(new Event('help-fab-show'));
    }
  }, [open]);

  useEffect(() => {
    try { localStorage.setItem('chatbotLang', lang); } catch { /* ignore */ }
  }, [lang]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const isGreeting = /^(hi|hello|hey)\b/i.test(trimmed) || /^hi\s*i'?m\s*gozy/i.test(trimmed) || /^hello\s*i'?m\s*gozy/i.test(trimmed);
    // handle chip commands like FROM:BLR, TO:GOX, DATE:2025-11-03
    if (trimmed.startsWith('FROM:') || trimmed.startsWith('TO:') || trimmed.startsWith('DATE:')) {
      handleFlowCommand(trimmed);
      return;
    }
    const m: ChatMsg = { id: `u_${Date.now()}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, m]);
    // Do not save simple greetings to recent chips
    if (!isGreeting) {
      try {
        const next = [trimmed, ...recents.filter(r => r !== trimmed)].slice(0, 5);
        setRecents(next);
        localStorage.setItem('chatRecents', JSON.stringify(next));
      } catch { /* ignore */ }
    }
    setIsTyping(true);
    setTimeout(() => respond(trimmed), 2000);
  };

  const startFlightFlow = () => {
    setFlow({ type: 'flight', step: 'from' });
    pushBot('Sure, let’s book a flight. First, pick your From city (you can also type it).');
  };

  const handleFlowCommand = (cmd: string) => {
    if (!flow || flow.type !== 'flight') return;
    const next: NonNullable<FlightFlow> = { ...flow } as NonNullable<FlightFlow>;
    if (cmd.startsWith('FROM:')) {
      next.from = cmd.split(':')[1];
      next.step = 'to';
      setFlow(next);
      pushBot(`From set to ${next.from}. Now pick destination.`);
    } else if (cmd.startsWith('TO:')) {
      next.to = cmd.split(':')[1];
      next.step = 'date';
      setFlow(next);
      pushBot(`To set to ${next.to}. Choose a date.`);
    } else if (cmd.startsWith('DATE:')) {
      next.date = cmd.substring(5);
      setFlow(next);
      finalizeFlightFlow(next);
    }
  };

  const finalizeFlightFlow = (f: NonNullable<FlightFlow>) => {
    if (f.from && f.to && f.date) {
      pushBot('Searching flights for you… ✈️', () => {
        try {
          const searchData = { type: 'flight' as const, fromLocation: formatCityCode(f.from!), toLocation: formatCityCode(f.to!), departureDate: f.date!, returnDate: '', travelers: 1 };
          localStorage.setItem('travelSearch', JSON.stringify(searchData));
          localStorage.setItem('bookingType','flight');
        } catch { /* ignore */ }
        setCurrentModule('travel');
        setCurrentPage('travel-results');
        setFlow(null);
        setOpen(false);
      });
    } else {
      pushBot('Almost done. Please complete the remaining steps.');
    }
  };

  const formatCityCode = (code: string) => {
    const map: Record<string,string> = { BLR: 'Bengaluru (BLR)', DEL: 'Delhi (DEL)', BOM: 'Mumbai (BOM)', HYD: 'Hyderabad (HYD)', MAA: 'Chennai (MAA)', CCU: 'Kolkata (CCU)', GOX: 'Goa (GOX)', GOI: 'Goa (GOI)' };
    return map[code] || code;
  };

  const quickNav = (dest: 'flights'|'food'|'shopping'|'tickets'|'wallet'|'offers'|'help') => {
    switch (dest) {
      case 'flights': setCurrentModule('travel'); setCurrentPage('travel-flights'); break;
      case 'food': setCurrentModule('food'); setCurrentPage('food-home'); break;
      case 'shopping': setCurrentModule('shopping'); setCurrentPage('shopping-home'); break;
      case 'tickets': setCurrentModule('tickets'); setCurrentPage('tickets-home'); break;
      case 'wallet': setCurrentModule('wallet'); setCurrentPage('wallet-home'); break;
      case 'offers': setCurrentPage('wallet-offers'); break;
      case 'help': setCurrentPage('help-center'); break;
    }
    setOpen(false);
  };

  const respond = (userText: string) => {
    const t = userText.toLowerCase();
    // very simple intent parsing
    // greetings/intros
    if (t === 'hello' || t === 'hi' || t === 'hey') {
      return pushBot(greetings[lang] || greetings['en']);
    }
    if (/^hi\s*i'?m\s*gozy/.test(t) || /^hello\s*i'?m\s*gozy/.test(t)) {
      return pushBot("Nice to meet you! I’m Gozy Assistant. How can I help?");
    }
  if (/book.*flight|flight.*book|search.*flight/i.test(t)) { startFlightFlow(); return; }
  if (/flight|plane|air/i.test(t)) return pushBot('Opening flights for you ✈️', () => quickNav('flights'));
    if (/hotel|stay/i.test(t)) return pushBot('Taking you to hotels 🏨', () => { setCurrentModule('travel'); setCurrentPage('travel-hotels'); setOpen(false); });
    if (/bus/i.test(t)) return pushBot('Here are buses 🚌', () => { setCurrentModule('travel'); setCurrentPage('travel-buses'); setOpen(false); });
    if (/train/i.test(t)) return pushBot('Here are trains 🚆', () => { setCurrentModule('travel'); setCurrentPage('travel-trains'); setOpen(false); });
    if (/food|order|pizza|burger/i.test(t)) return pushBot('Opening Food 🍔', () => quickNav('food'));
    if (/shop|buy|cart|product/i.test(t)) return pushBot('Let’s go shopping 🛍️', () => quickNav('shopping'));
    if (/movie|ticket|cinema/i.test(t)) return pushBot('Movies & Tickets 🎬', () => quickNav('tickets'));
    if (/wallet|balance|money/i.test(t)) return pushBot('Your wallet 💳', () => quickNav('wallet'));
    if (/offer|coupon|deal/i.test(t)) return pushBot('Offers for you 🎁', () => quickNav('offers'));
    if (/help|support|issue/i.test(t)) return pushBot('Help center 🛟', () => quickNav('help'));

    // default reply includes module overview and suggestions
    const ov = overview[lang] || overview['en'];
    pushBot(ov);
  };

  const pushBot = (text: string, then?: () => void) => {
    const b: ChatMsg = { id: `b_${Date.now()}`, role: 'bot', text };
    setMessages((prev) => [...prev, b]);
    setIsTyping(false);
    if (then) setTimeout(then, 350);
  };

  function parseLanguage(input: string): Lang {
    const s = (input || '').trim().toLowerCase();
    const map: Record<string, Lang> = {
      'en': 'en', 'eng': 'en', 'english': 'en', 'अंग्रेज़ी': 'en', 'anglais': 'en',
      'hi': 'hi', 'hindi': 'hi', 'हिंदी': 'hi', 'हिन्दी': 'hi',
      'kn': 'kn', 'kannada': 'kn', 'ಕನ್ನಡ': 'kn',
      'te': 'te', 'telugu': 'te', 'తెలుగు': 'te',
      'ta': 'ta', 'tamil': 'ta', 'தமிழ்': 'ta',
      'as': 'as', 'assamese': 'as', 'অসমীয়া': 'as',
      'bn': 'bn', 'bengali': 'bn', 'bangla': 'bn', 'বাংলা': 'bn',
      'brx': 'brx', 'bodo': 'brx', 'बड़ो': 'brx',
      'doi': 'doi', 'dogri': 'doi', 'डोगरी': 'doi',
      'gu': 'gu', 'gujarati': 'gu', 'ગુજરાતી': 'gu',
      'ks': 'ks', 'kashmiri': 'ks', 'کٲشُر': 'ks',
      'kok': 'kok', 'konkani': 'kok', 'कोंकणी': 'kok',
      'mai': 'mai', 'maithili': 'mai', 'मैथिली': 'mai',
      'ml': 'ml', 'malayalam': 'ml', 'മലയാളം': 'ml',
      'mni': 'mni', 'meitei': 'mni', 'manipuri': 'mni', 'মৈতৈলোন্': 'mni',
      'mr': 'mr', 'marathi': 'mr', 'मराठी': 'mr',
      'ne': 'ne', 'nepali': 'ne', 'नेपाली': 'ne',
      'or': 'or', 'odia': 'or', 'oriya': 'or', 'ଓଡ଼ିଆ': 'or',
      'pa': 'pa', 'punjabi': 'pa', 'ਪੰਜਾਬੀ': 'pa',
      'sa': 'sa', 'sanskrit': 'sa', 'संस्कृतम्': 'sa',
      'sat': 'sat', 'santali': 'sat', 'ᱥᱟᱱᱛᱟᱲᱤ': 'sat',
      'sd': 'sd', 'sindhi': 'sd', 'سنڌي': 'sd',
      'ur': 'ur', 'urdu': 'ur', 'اردو': 'ur',
    };
    if (map[s]) return map[s];
    // Heuristic matching: contains native label
    if (/हिंदी|हिन्दी/.test(input)) return 'hi';
    if (/ಕನ್ನಡ/.test(input)) return 'kn';
    if (/తెలుగు/.test(input)) return 'te';
    if (/தமிழ்/.test(input)) return 'ta';
    if (/অসমীয়া/.test(input)) return 'as';
    if (/বাংলা/.test(input)) return 'bn';
    if (/बड़ो|bodo/i.test(input)) return 'brx';
    if (/डोगरी/.test(input) || /dogri/i.test(input)) return 'doi';
    if (/ગુજરાતી/.test(input) || /gujarati/i.test(input)) return 'gu';
    if (/کٲشُر/.test(input)) return 'ks';
    if (/कोंकणी/.test(input) || /konkani/i.test(input)) return 'kok';
    if (/मैथिली/.test(input) || /maithili/i.test(input)) return 'mai';
    if (/മലയാളം/.test(input)) return 'ml';
    if (/মৈতৈলোন্|meitei|manipuri/i.test(input)) return 'mni';
    if (/मराठी|marathi/i.test(input)) return 'mr';
    if (/नेपाली|nepali/i.test(input)) return 'ne';
    if (/ଓଡ଼ିଆ|odia|oriya/i.test(input)) return 'or';
    if (/ਪੰਜਾਬੀ|punjabi/i.test(input)) return 'pa';
    if (/संस्कृतम्|sanskrit/i.test(input)) return 'sa';
    if (/ᱥᱟᱱᱛᱟᱲᱤ|santali/i.test(input)) return 'sat';
    if (/سنڌي|sindhi/i.test(input)) return 'sd';
    if (/اردو|urdu/i.test(input)) return 'ur';
    return 'en';
  }

  const labels = useMemo(() => ({
    askLang: greetings[lang] || greetings['en'],
    placeholder: lang==='en' ? 'Type your question…' : lang==='hi' ? 'अपना सवाल लिखें…' : 'Type…',
  }), [lang]);

  const flowChips = useMemo(() => {
    if (!flow || flow.type !== 'flight') return [] as { key: string; label: string }[];
    if (flow.step === 'from') return [
      { key: 'FROM:BLR', label: 'From BLR' },
      { key: 'FROM:DEL', label: 'From DEL' },
      { key: 'FROM:BOM', label: 'From BOM' },
      { key: 'FROM:HYD', label: 'From HYD' },
      { key: 'FROM:MAA', label: 'From MAA' },
    ];
    if (flow.step === 'to') return [
      { key: 'TO:GOX', label: 'To GOX' },
      { key: 'TO:GOI', label: 'To GOI' },
      { key: 'TO:DEL', label: 'To DEL' },
      { key: 'TO:BOM', label: 'To BOM' },
    ];
    if (flow.step === 'date') {
      const today = new Date();
      const tomorrow = new Date(Date.now() + 86400000);
      const fmt = (d: Date) => d.toISOString().slice(0,10);
      return [
        { key: `DATE:${fmt(today)}`, label: 'Today' },
        { key: `DATE:${fmt(tomorrow)}`, label: 'Tomorrow' },
        { key: `DATE:${fmt(nextWeekend())}`, label: 'This weekend' },
      ];
    }
    return [];
  }, [flow]);

  function nextWeekend() {
    const d = new Date();
    const day = d.getDay(); // 0 Sun .. 6 Sat
    const diff = (6 - day + 7) % 7; // next Saturday
    d.setDate(d.getDate() + diff);
    return d;
  }

  function getSuggestions(page?: string | null) {
    switch (page) {
      case 'travel-home':
      case 'travel-results':
        return ['Flights to Goa this week', 'Set fare alert', 'Recent routes', 'Today\'s offers'];
      case 'food-home':
      case 'food-menu':
        return ['Best burgers nearby', 'Top pizzas near me', 'Offers on food', 'Track my order'];
      case 'shopping-home':
      case 'shopping-search':
        return ['Deals on mobiles', 'Today\'s offers', 'Track my order', 'Compare items'];
      case 'tickets-home':
        return ['Movies near me', 'Today\'s offers', 'Top-rated movies', 'Track my booking'];
      default:
        return ['Flights to Goa this week', 'Today\'s offers', 'Track my order', 'Best burgers nearby'];
    }
  }

  function startVoice() {
    try {
      const w = window as unknown as { webkitSpeechRecognition?: new ()=>WebSpeechRecognition; SpeechRecognition?: new ()=>WebSpeechRecognition };
      const SpeechRecognitionCtor = w.webkitSpeechRecognition || w.SpeechRecognition;
      if (!SpeechRecognitionCtor) {
        pushBot('Voice input is not supported in this browser.');
        return;
      }
      const recog = new SpeechRecognitionCtor();
      recog.lang = 'en-IN';
      recog.interimResults = false;
      recog.maxAlternatives = 1;
      recog.onresult = (e) => {
        const said = e.results && e.results[0] && e.results[0][0] ? e.results[0][0].transcript : '';
        if (said) send(said);
      };
      recog.onerror = () => pushBot('Could not capture audio. Please try again.');
      recog.start();
    } catch {
      pushBot('Voice input is not available right now.');
    }
  }

  return (
    <>
      {/* FAB with GIF (fallback to icon) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-[85] rounded-full p-1 shadow-xl bg-white border border-gray-200 hover:shadow-2xl ring-2 ring-teal-400/40 animate-[pulse_2.8s_ease-in-out_infinite]"
        aria-label="Open chat bot"
        title="Chat with Gozy Assistant"
      >
        <span className="block w-14 h-14 rounded-full overflow-hidden">
          <img
            src={gifUrl}
            alt="Gozy Chatbot"
            className="w-full h-full object-cover"
            onError={(e)=>{
              const img = e.currentTarget as HTMLImageElement;
              if (!img.dataset.fallback1) { img.dataset.fallback1 = '1'; img.src = '/chatbot-pink.gif'; return; }
              if (!img.dataset.fallback2) { img.dataset.fallback2 = '1'; img.src = '/chatbot-blue.gif'; return; }
              if (!img.dataset.fallback3) { img.dataset.fallback3 = '1'; img.src = '/chatbot.gif'; return; }
              img.style.display='none';
            }}
          />
          <span className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white" style={{display:'none'}}>
            <MessageCircle className="w-7 h-7" />
          </span>
        </span>
      </button>

      {open && (
          <div className="fixed bottom-24 right-4 z-[90] bg-white w-[92vw] sm:w-[420px] max-h-[70vh] rounded-2xl shadow-2xl flex flex-col border border-gray-200">
            <div className="flex items-center justify-between p-3 border-b relative">
              <div className="flex items-center gap-2 font-bold text-gray-800"><Globe className="w-4 h-4"/> Gozy Assistant</div>
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button onClick={()=> setShowMenu(s=>!s)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Settings"><Settings className="w-4 h-4"/></button>
                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-40 bg-white border rounded-xl shadow z-10">
                      <button onClick={()=> { setShowLangPrompt(true); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">Change language…</button>
                      <button onClick={()=> { try { localStorage.setItem('chatbotGifUrl','/chatbot-blue.gif'); } catch { /* ignore */ } setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">Use Blue GIF</button>
                      <button onClick={()=> { try { localStorage.setItem('chatbotGifUrl','/chatbot-pink.gif'); } catch { /* ignore */ } setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">Use Pink GIF</button>
                    </div>
                  )}
                </div>
                <button onClick={() => { setOpen(false); try { localStorage.removeItem('helpFabVisible'); } catch { /* ignore */ } window.dispatchEvent(new Event('help-fab-hide')); }} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close"><X className="w-4 h-4"/></button>
              </div>
            </div>
            {/* Type-your-language prompt */}
            {showLangPrompt ? (
              <form className="p-3 border-b flex items-center gap-2" onSubmit={(e)=> { e.preventDefault(); const input = (e.currentTarget.elements.namedItem('lang') as HTMLInputElement); const chosen = parseLanguage(input.value); setLang(chosen); try { localStorage.setItem('chatbotLang', chosen); } catch { /* ignore */ } setMessages([{ id:'m1', role:'bot', text: greetings[chosen] || greetings['en'] }, { id:'m2', role:'bot', text: overview[chosen] || overview['en'] }]); setShowLangPrompt(false); }}>
                <input name="lang" placeholder="Type your language (e.g., English, हिन्दी, ಕನ್ನಡ)" className="flex-1 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
                <button type="submit" className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">Set</button>
              </form>
            ) : (
              <div className="px-3 py-2 border-b text-xs text-gray-600">Language: <span className="font-semibold uppercase">{lang}</span> • <button className="underline hover:text-indigo-700" onClick={()=> setShowLangPrompt(true)}>change</button></div>
            )}

            {/* Quick actions */}
            <div className="p-3 border-b grid grid-cols-3 gap-2">
              <button onClick={() => quickNav('flights')} className="flex items-center gap-2 p-2 rounded-xl border hover:bg-gray-50"><Plane className="w-4 h-4"/>Flights</button>
              <button onClick={() => quickNav('food')} className="flex items-center gap-2 p-2 rounded-xl border hover:bg-gray-50"><Utensils className="w-4 h-4"/>Food</button>
              <button onClick={() => quickNav('shopping')} className="flex items-center gap-2 p-2 rounded-xl border hover:bg-gray-50"><ShoppingBag className="w-4 h-4"/>Shopping</button>
              <button onClick={() => quickNav('tickets')} className="flex items-center gap-2 p-2 rounded-xl border hover:bg-gray-50"><Ticket className="w-4 h-4"/>Tickets</button>
              <button onClick={() => quickNav('wallet')} className="flex items-center gap-2 p-2 rounded-xl border hover:bg-gray-50"><WalletIcon className="w-4 h-4"/>Wallet</button>
              <button onClick={() => quickNav('offers')} className="flex items-center gap-2 p-2 rounded-xl border hover:bg-gray-50"><Gift className="w-4 h-4"/>Offers</button>
              <button onClick={() => quickNav('help')} className="flex items-center gap-2 p-2 rounded-xl border hover:bg-gray-50 col-span-3"><HelpCircle className="w-4 h-4"/>Help Center</button>
            </div>

            {/* Scrollable content: suggestions first, then messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Contextual suggestions */}
              <div className="flex flex-wrap gap-2">
                {getSuggestions(currentPage).map(s => (
                  <button key={s} onClick={()=> send(s)} className="px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-xs border">{s}</button>
                ))}
              </div>
              {messages.map(m => (
                <div key={m.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role==='bot' ? 'bg-gray-100 text-gray-800' : 'bg-indigo-600 text-white ml-auto'}`}>{m.text}</div>
              ))}
              {isTyping && (
                <div className="max-w-[70%] rounded-2xl px-3 py-2 text-sm bg-gray-100 text-gray-500 inline-flex items-center gap-2">
                  <span>Typing</span>
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'120ms'}} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'240ms'}} />
                  </span>
                </div>
              )}
              {/* Recents */}
              {recents.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recents.map(r => (
                    <button key={r} onClick={()=> send(r)} className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs">{r}</button>
                  ))}
                </div>
              )}
              {/* Flow chips */}
              {flowChips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {flowChips.map(c => (
                    <button key={c.key} onClick={()=> send(c.key)} className="px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-xs border border-indigo-200 text-indigo-700">{c.label}</button>
                  ))}
                </div>
              )}
              {/* Suggested prompts */}
              {/* Intro chips: user asked for 'hello' and 'Hi I’m Gozy' side-by-side */}
              <div className="flex flex-wrap gap-2">
                {['hello', "Hi I'm Gozy"].map((s) => (
                  <button key={s} onClick={()=> send(s)} className="px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-xs border">{s}</button>
                ))}
              </div>
              {/* Contextual suggestions */}
              <div className="flex flex-wrap gap-2">
                {getSuggestions(currentPage).map(s => (
                  <button key={s} onClick={()=> send(s)} className="px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-xs border">{s}</button>
                ))}
              </div>
            </div>

            {/* Input pinned at bottom */}
            <form className="p-3 flex items-center gap-2 border-t" onSubmit={(e) => { e.preventDefault(); send(input); setInput(''); }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={labels.placeholder} className="flex-1 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="button" onClick={startVoice} className="p-2 rounded-xl border hover:bg-gray-50" title="Voice input"><Mic className="w-4 h-4 text-gray-600"/></button>
              <button type="submit" className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"><Send className="w-4 h-4"/></button>
            </form>
          </div>
      )}
    </>
  );
}
