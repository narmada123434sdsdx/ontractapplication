// App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";  // CSS loaded here
import "./App.css";

/* Common / Individual */
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import OTPVerification from "./components/OTPVerification";
import ActivateAccount from "./components/ActivateAccount";
import ProviderProfile from "./components/ProviderProfile";
import ProviderServices from "./components/ProviderServices";
import ProviderHome from "./components/ProviderHome";
import ForgotPassword from "./components/ForgotPassword";

/* Admin */
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

/* Contractor */
import CompanyLogin from "./components/company/CompanyLogin";
import CompanySignup from "./components/company/CompanySignup";
import CompanyActivateAccount from "./components/company/CompanyActivateAccount";
import CompanyOTPVerification from "./components/company/CompanyOTPVerification";
import CompanyDashboardHome from "./components/company/CompanyDashboardHome";
import CompanyProfile from "./components/company/CompanyProfile";
import CompanyServices from "./components/company/CompanyServices";
import CompanyApp from "./components/company/CompanyApp";
import CompanyNotifications from "./components/company/CompanyNotifications";

/* Admin App */
import AdminApp from "./components/AdminApp";
import Notifications from "./components/Notifications";


// ------------------------------------------------------
//  GLOBAL BOOTSTRAP JS LOADER — Works on Localhost & Vercel
// ------------------------------------------------------
function useBootstrapLoader() {
  useEffect(() => {
    const loadBootstrap = async () => {
      // If already loaded, skip
      if (window.bootstrap) {
        console.log("Bootstrap already loaded.");
        return;
      }

      try {
        // Try to load from node_modules
        await import("bootstrap/dist/js/bootstrap.bundle.min.js");
        console.log("Bootstrap JS loaded via import()");
      } catch (err) {
        console.warn("Import failed, loading via CDN...", err);

        // Important fallback for Vercel
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js";
        script.onload = () =>
          console.log("Bootstrap JS loaded via CDN fallback.");
        script.onerror = () => console.error("CDN Bootstrap load failed.");
        document.body.appendChild(script);
      }
    };

    loadBootstrap();
  }, []);
}


// ------------------------------------------------------
// LAYOUT COMPONENT
// ------------------------------------------------------
function Layout({ user, setUser, admin, setAdmin, contractor, setContractor }) {
  const location = useLocation();

  const hideLayout =
    location.pathname.startsWith("/provider") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/contractor/dashboard");

  // -----------------------------
  // NAVBAR DROPDOWN LOGIC
  // -----------------------------
  useEffect(() => {
    const navLinks = document.querySelectorAll(".navbar-collapse .nav-link");
    const navbarCollapse = document.querySelector(".navbar-collapse");

    if (!navbarCollapse) return;

    const handleLinkClick = (e) => {
      const isDropdown =
        e.target.classList.contains("dropdown-toggle") ||
        e.target.closest(".dropdown-menu");

      if (isDropdown) return;

      if (navbarCollapse.classList.contains("show")) {
        const bsCollapse = new window.bootstrap.Collapse(navbarCollapse, {
          toggle: false,
        });
        bsCollapse.hide();
      }
    };

    const dropdownMenus = document.querySelectorAll(".dropdown-menu");
    dropdownMenus.forEach((menu) =>
      menu.addEventListener("click", (e) => e.stopPropagation())
    );

    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
    dropdownToggles.forEach((toggle) => {
      toggle.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        dropdownToggles.forEach((other) => {
          if (other !== this) {
            const openMenu = other.nextElementSibling;
            if (openMenu?.classList.contains("show")) {
              openMenu.classList.remove("show");
            }
          }
        });

        const dropdownMenu = this.nextElementSibling;
        dropdownMenu?.classList.toggle("show");
      });
    });

    navLinks.forEach((link) => link.addEventListener("click", handleLinkClick));

    return () => {
      navLinks.forEach((link) =>
        link.removeEventListener("click", handleLinkClick)
      );
    };
  }, []);


  // -----------------------------
  // LAYOUT JSX
  // -----------------------------
  return (
    <div className="min-h-screen d-flex flex-column">
      {!hideLayout && (
        <nav className="navbar navbar-expand-lg sticky-top">
          <div className="container">
            <Link className="navbar-brand fw-bold" to="/">
              Ontract Services
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto align-items-center">
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Home
                  </Link>
                </li>

                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    data-bs-toggle="dropdown"
                  >
                    Login
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/login">
                        Individual
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/contractor/login">
                        Contractor
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="nav-item dropdown ms-2">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    data-bs-toggle="dropdown"
                  >
                    Sign Up
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/signup">
                        Individual
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/contractor/signup">
                        Contractor
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}

      <main className="flex-fill">
        <Routes>
          {/* INDIVIDUAL */}
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/activate" element={<ActivateAccount />} />
          <Route path="/forgot_password" element={<ForgotPassword />} />

          {/* PROVIDER */}
          <Route path="/provider_home" element={<ProviderHome user={user} />}>
            <Route path="profile" element={<ProviderProfile />} />
            <Route path="services" element={<ProviderServices />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* CONTRACTOR */}
          <Route path="/contractor/login" element={<CompanyLogin />} />
          <Route path="/contractor/signup" element={<CompanySignup />} />
          <Route path="/contractor/activate" element={<CompanyActivateAccount />} />
          <Route path="/contractor/verify_otp" element={<CompanyOTPVerification />} />

          <Route
            path="/contractor/dashboard"
            element={<CompanyApp contractor={contractor} />}
          >
            <Route path="home" element={<CompanyDashboardHome />} />
            <Route path="profile" element={<CompanyProfile />} />
            <Route path="services" element={<CompanyServices />} />
            <Route path="notifications" element={<CompanyNotifications />} />
          </Route>

          {/* ADMIN */}
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* FALLBACK */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}


// ------------------------------------------------------
// MAIN APP COMPONENT
// ------------------------------------------------------
export default function App() {
  const [user, setUser] = React.useState(null);
  const [admin, setAdmin] = React.useState(null);
  const [contractor, setContractor] = React.useState(null);

  // Load Bootstrap JS globally
  useBootstrapLoader();

  // Restore stored user/admin/contractor
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedAdmin = localStorage.getItem("admin");
      if (storedAdmin) setAdmin(JSON.parse(storedAdmin));

      const storedContractor = localStorage.getItem("contractor");
      if (storedContractor) setContractor(JSON.parse(storedContractor));
    } catch (err) {
      console.error("LocalStorage parse error", err);
    }
  }, []);

  return (
    <Layout
      user={user}
      setUser={setUser}
      admin={admin}
      setAdmin={setAdmin}
      contractor={contractor}
      setContractor={setContractor}
    />
  );
}
