import { useNavigate } from "react-router-dom";
import { useForm, ValidationError } from "@formspree/react";
import warehouseVaultsImg from "../assets/vaults.jpg";

export default function LandingPage() {
  const navigate = useNavigate();
  const [state, handleSubmit] = useForm("manjebko");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full flex justify-end px-8 py-6 fixed top-0 left-0 z-50">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-primary font-semibold bg-white border border-primary rounded-full px-5 py-2 shadow hover:bg-primary hover:text-white transition"
        >
          Log In
        </button>
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
            Submit a Request
          </a>
        </div>
      </header>

      {/* Feature Cards Section with full-width background image and lighter overlay */}
      <section
        className="relative w-full px-0 py-16"
        style={{
          backgroundImage: `linear-gradient(rgba(30,41,59,0.35), rgba(30,41,59,0.35)), url(${warehouseVaultsImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 px-4">
          <div className="bg-white bg-opacity-90 rounded-xl shadow-md p-10 flex flex-col items-center hover:shadow-xl transition relative z-10 max-w-xs mx-auto">
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
          <div className="bg-white bg-opacity-90 rounded-xl shadow-md p-10 flex flex-col items-center hover:shadow-xl transition relative z-10 max-w-xs mx-auto">
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
          <div className="bg-white bg-opacity-90 rounded-xl shadow-md p-10 flex flex-col items-center hover:shadow-xl transition relative z-10 max-w-xs mx-auto">
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
            — Ian, Operations Manager at Naglee Moving & Storage
          </div>
        </div>
      </section>

      {/* Commented out the whole "Tell Us About Your Warehouse Needs" part and container */}
      {/*
      <section
        id="signup"
        className="w-full flex justify-center py-16 bg-gradient-to-t from-background via-white to-accent"
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 border border-accent">
          <h2 className="text-2xl font-extrabold mb-6 text-primary text-center">
            Tell Us About Your Warehouse Needs
          </h2>
          {state.succeeded ? (
            <div className="text-success font-semibold text-center">
              Thank you! Your request has been submitted. We'll be in touch soon.
            </div>
          ) : (
            null
          )}
        </div>
      </section>
      */}
      <footer className="w-full py-6 text-center text-slate text-sm">
        &copy; {new Date().getFullYear()} Warehouse Manager. All rights reserved.
      </footer>
    </div>
  );
}