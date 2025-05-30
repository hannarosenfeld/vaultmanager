import { useState } from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full flex justify-end px-8 py-6 absolute top-0 left-0 z-20">
        <Link
          to="/login"
          className="text-primary font-semibold bg-white border border-primary rounded-full px-5 py-2 shadow hover:bg-primary hover:text-white transition"
        >
          Log In
        </Link>
      </div>
      <header className="w-full bg-gradient-to-r from-primary to-accent py-16 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
          <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            Warehouse Manager
          </h1>
          <p className="text-xl text-background mb-6 max-w-2xl">
            Transform your warehouse operations with real-time tracking, intuitive
            layouts, and paperless efficiency. Trusted by industry leaders like
            Naglee Moving & Storage.
          </p>
          <a
            href="#signup"
            className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-accent hover:text-white transition"
          >
            Create Your Free Account
          </a>
        </div>
      </header>

      <section className="max-w-5xl w-full px-6 py-16 grid md:grid-cols-3 gap-10">
        <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center hover:shadow-xl transition">
          <svg
            className="w-12 h-12 text-accent mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7M3 7h18" />
          </svg>
          <h3 className="font-bold text-lg mb-2 text-primary">
            Real-Time Inventory
          </h3>
          <p className="text-slate text-center">
            Instantly see what’s in your warehouse, where it’s stored, and who
            moved it—no more paper lists or guesswork.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center hover:shadow-xl transition">
          <svg
            className="w-12 h-12 text-success mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-bold text-lg mb-2 text-primary">
            Lightning Fast
          </h3>
          <p className="text-slate text-center">
            Modern, responsive interface built for speed—update layouts, racks,
            and vaults in seconds.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center hover:shadow-xl transition">
          <svg
            className="w-12 h-12 text-warning mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 17v-2a4 4 0 018 0v2M5 21v-2a4 4 0 018 0v2M7 7a4 4 0 118 0 4 4 0 01-8 0z" />
          </svg>
          <h3 className="font-bold text-lg mb-2 text-primary">
            Collaboration Ready
          </h3>
          <p className="text-slate text-center">
            Multiple users, real-time updates, and secure cloud storage—everyone’s
            always on the same page.
          </p>
        </div>
      </section>

      <section className="w-full bg-accent py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <blockquote className="text-xl text-primary italic mb-4">
            “Warehouse Manager has completely transformed our workflow. We’re
            faster, more organized, and never lose track of a vault or pallet.
            It’s a game changer.”
          </blockquote>
          <div className="text-primary font-semibold">
            — Ian, Warehouse Manager at Naglee Moving & Storage
          </div>
        </div>
      </section>

      <section
        id="signup"
        className="w-full flex justify-center py-16 bg-gradient-to-t from-background via-white to-accent"
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 border border-accent">
          <h2 className="text-2xl font-extrabold mb-6 text-primary text-center">
            Create Your Warehouse Manager Account
          </h2>
          {submitted ? (
            <div className="text-success font-semibold text-center">
              Thank you for your interest! Your account request has been received.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-charcoal font-medium mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-slate rounded px-3 py-2 focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="company"
                  className="block text-charcoal font-medium mb-1"
                >
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  value={form.company}
                  onChange={handleChange}
                  className="w-full border border-slate rounded px-3 py-2 focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-charcoal font-medium mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-slate rounded px-3 py-2 focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-charcoal font-medium mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-slate rounded px-3 py-2 focus:ring-2 focus:ring-accent"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white font-semibold py-2 rounded-lg shadow-md hover:bg-accent hover:text-white transition"
              >
                Create Account
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="w-full py-6 text-center text-slate text-sm">
        &copy; {new Date().getFullYear()} Warehouse Manager. All rights reserved.
      </footer>
    </div>
  );
}