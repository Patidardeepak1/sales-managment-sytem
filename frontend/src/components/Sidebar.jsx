import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard', icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    ), path: '/dashboard' },
  { label: 'Nexus', icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    ), path: '/nexus' },
  { label: 'Intake', icon: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
    ), path: '/intake' },
];

const serviceItems = [
  { label: 'Pre-active', path: '/services/pre-active' },
  { label: 'Active', path: '/services/active' },
  { label: 'Blocked', path: '/services/blocked' },
  { label: 'Closed', path: '/services/closed' },
];
const invoiceItems = [
  { label: 'Proforma Invoices', path: '/invoices/proforma', bold: true },
  { label: 'Final Invoices', path: '/invoices/final' },
];

const Sidebar = () => {
  const [servicesOpen, setServicesOpen] = useState(true);
  const [invoicesOpen, setInvoicesOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="w-64 bg-white text-gray-700 min-h-screen border-r border-gray-100 fixed left-0 top-0 z-10">
      <div className="p-5">
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none"><path d="M20 2L35 10V30L20 38L5 30V10L20 2Z" fill="#A5B4FC" stroke="#6366F1" strokeWidth="1" /><path d="M20 6L30 12V28L20 34L10 28V12L20 6Z" fill="#6366F1"/></svg>
          </div>
          <div>
            <div className="text-lg font-bold text-black">Vault</div>
            <div className="text-xs text-gray-400 mt-0.5">Anurag Yadav</div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-0.5 mb-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-lg transition text-[15px] font-medium ${isActive ? 'bg-gray-100 text-black font-bold' : 'text-gray-700 hover:bg-gray-50'} `
              }
              end
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Section: Services */}
        <div className="mb-6">
          <div
            className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 text-gray-600"
            onClick={() => setServicesOpen(!servicesOpen)}
          >
            <span className="">Services</span>
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${servicesOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </div>
          {servicesOpen && <div className="ml-4 mt-2 space-y-1">
            {serviceItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block px-3 py-1.5 rounded text-[15px] ${isActive ? 'bg-gray-100 text-black font-bold' : 'text-gray-700 hover:bg-gray-50'} `}
                end
              >
                {item.label}
              </NavLink>
            ))}
          </div>}
        </div>

        {/* Section: Invoices */}
        <div className="mb-2">
          <div
            className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 text-gray-600"
            onClick={() => setInvoicesOpen(!invoicesOpen)}
          >
            <span>Invoices</span>
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${invoicesOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </div>
          {invoicesOpen && <div className="ml-4 mt-2 space-y-1">
            {invoiceItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block px-3 py-1.5 rounded text-[15px] ${isActive ? 'bg-gray-100 text-black font-bold' : item.bold ? 'font-bold text-gray-700' : 'text-gray-700'} hover:bg-gray-50`}
                end
              >
                {item.label}
              </NavLink>
            ))}
          </div>}
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
