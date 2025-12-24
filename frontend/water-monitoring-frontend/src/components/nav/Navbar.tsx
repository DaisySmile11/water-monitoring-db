import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import favicon from "../../assets/favicon.png";


function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "px-3 py-2 text-sm font-semibold rounded-lg transition " +
        (isActive
          ? "bg-white/20 text-white"
          : "text-white/90 hover:bg-white/15 hover:text-white")
      }
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-brand-700 shadow-md">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3 text-white">
          <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <img
              src={favicon}
              alt="Salinity Icon"
              className="h-7 w-7"
            />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-extrabold tracking-tight">Water Monitoring</div>
            <div className="text-xs text-white/80">Mekong Delta Sensor Network</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <NavItem to="/" label="Home" />
          <NavItem to="/devices" label="Devices" />
          {isAdmin ? (
            <>
              <NavItem to="/admin" label="Admin" />
              <button
                onClick={onLogout}
                className="ml-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                Logout
              </button>
            </>
          ) : (
            <NavItem to="/login" label="Login" />
          )}
        </nav>
      </div>
    </header>
  );
}
