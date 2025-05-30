import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import { login } from "../store/session";
import naglee from "../assets/no_background_logo.png";

const LoginPage = () => {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);

  if (sessionUser) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await dispatch(login(email.toLowerCase(), password));
    if (data) {
      setErrors(data);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="w-full max-w-md space-y-8 bg-white rounded-3xl shadow-2xl p-12 border border-blue-100">
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <div className="absolute inset-0 rounded-full bg-white/60 backdrop-blur-md shadow-lg" />
            <img
              className="relative h-24 w-24 object-contain rounded-full border-4 border-white shadow-xl"
              src={naglee}
              alt="Naglee Logo"
            />
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-primary drop-shadow-sm">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <form className="space-y-7" onSubmit={handleSubmit}>
            <ul className="text-red-500 text-sm mb-2">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-charcoal mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-lg bg-background px-3 py-2 text-base text-charcoal border border-slate placeholder:text-slate focus:ring-2 focus:ring-accent focus:outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-charcoal mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-lg bg-background px-3 py-2 text-base text-charcoal border border-slate placeholder:text-slate focus:ring-2 focus:ring-accent focus:outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-lg bg-primary px-3 py-2 text-base font-semibold text-white shadow-md hover:bg-accent hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition"
            >
              Sign in
            </button>
          </form>
          <div className="mt-8 text-center">
            <Link to="/" className="text-accent hover:underline text-sm font-medium">
              &larr; Back to Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
