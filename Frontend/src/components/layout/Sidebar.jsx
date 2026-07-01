import { Link, useLocation } from 'react-router-dom';

export function Sidebar({ links = [], user }) {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-surface-container border-r border-outline-variant flex flex-col py-lg z-50">
      <div className="px-md mb-xl">
        <span className="font-h3 text-h3 font-bold text-on-surface">HireHub</span>
      </div>
      <nav className="flex-1 space-y-xs px-sm overflow-y-auto custom-scrollbar">
        {links.map((link, index) => {
          const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
          
          if (link.type === 'divider') {
            return <div key={`div-${index}`} className="my-md border-t border-outline-variant/30" />;
          }
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-md px-md py-sm transition-all rounded-lg ${
                isActive
                  ? 'sidebar-active'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="font-body text-body">{link.label || link.name}</span>
            </Link>
          );
        })}
      </nav>
      {user && (
        <div className="px-md mt-auto pt-lg border-t border-outline-variant/30">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden border border-outline">
              <img src={user.avatar || 'https://via.placeholder.com/40'} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-body text-body font-bold text-on-surface">{user.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">{user.role}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
