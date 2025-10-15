import { useApp } from '../context/AppContext';

export default function SiteFooter() {
  const { setCurrentPage } = useApp();
  return (
    <footer className="hidden md:block border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm text-gray-600">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          <div>
            <div className="font-semibold text-gray-900 mb-3">Gozy</div>
            <ul className="space-y-2">
              <li><button className="hover:underline" onClick={()=> setCurrentPage('about')}>About</button></li>
              <li><button className="hover:underline" onClick={()=> setCurrentPage('careers')}>Careers</button></li>
              <li><button className="hover:underline" onClick={()=> setCurrentPage('press')}>Press</button></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-3">Support</div>
            <ul className="space-y-2">
              <li><button className="hover:underline" onClick={()=> setCurrentPage('help-center')}>Help Center</button></li>
              <li><button className="hover:underline" onClick={()=> setCurrentPage('orders')}>Cancellation options</button></li>
              <li><button className="hover:underline" onClick={()=> setCurrentPage('privacy-security')}>Report issue</button></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-3">Legal</div>
            <ul className="space-y-2">
              <li><button className="hover:underline" onClick={()=> setCurrentPage('terms')}>Terms</button></li>
              <li><button className="hover:underline" onClick={()=> setCurrentPage('privacy-policy')}>Privacy</button></li>
              <li><button className="hover:underline" onClick={()=> setCurrentPage('privacy-security')}>Security</button></li>
            </ul>
          </div>
          <div className="col-span-2">
            <div className="font-semibold text-gray-900 mb-3">Subscribe</div>
            <div className="flex gap-2">
              <input type="email" className="border rounded-lg px-3 py-2 w-full max-w-sm" placeholder="Email address" />
              <button className="px-4 py-2 rounded-lg bg-gray-900 text-white">Join</button>
            </div>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between text-xs text-gray-500">
          <div>© {new Date().getFullYear()} Gozy. All rights reserved.</div>
          <div className="space-x-4">
            <a href="#" onClick={(e)=> e.preventDefault()} className="hover:underline">Sitemap</a>
            <a href="#" onClick={(e)=> e.preventDefault()} className="hover:underline">Company details</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
