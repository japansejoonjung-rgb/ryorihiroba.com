"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Lock, LogIn, Mail, User, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getAuthErrorMessage, loginUser, registerUser, sendResetPasswordEmail } from "@/lib/authService";
import { getFirebaseMissingKeys } from "@/lib/firebase";
import { recoveryQuestions } from "@/lib/userService";

type AuthMode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language, t, recoveryQuestionName } = useLanguage();
  const [mode, setMode] = useState<AuthMode>("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [recoveryQuestion, setRecoveryQuestion] = useState(recoveryQuestions[0].id);
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const missingKeys = useMemo(() => getFirebaseMissingKeys(), []);
  const firebaseReady = missingKeys.length === 0;

  const handleAuthSuccess = (message: string) => {
    setSuccess(message);
    router.push("/");
    router.refresh();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!firebaseReady) {
      setError(`${t.firebaseRequired}: ${missingKeys.join(", ")}`);
      return;
    }

    if (mode === "register" && displayName.trim().length < 2) {
      setError(t.nameTooShort);
      return;
    }

    if (mode === "register" && password !== passwordConfirm) {
      setError(t.passwordMismatch);
      return;
    }

    if (mode === "register" && recoveryAnswer.trim().length < 2) {
      setError(t.recoveryRequired);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "register") {
        await registerUser(email.trim(), password, displayName.trim(), recoveryQuestion, recoveryAnswer.trim());
        handleAuthSuccess(t.signupDone);
      } else {
        await loginUser(email.trim(), password);
        handleAuthSuccess(t.loginDone);
      }
    } catch (authError) {
      setError(getAuthErrorMessage(authError, language));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!firebaseReady) {
      setError(`${t.firebaseRequired}: ${missingKeys.join(", ")}`);
      return;
    }

    setResetting(true);
    try {
      await sendResetPasswordEmail(resetEmail.trim());
      setSuccess(t.resetSent);
      setShowReset(false);
    } catch (authError) {
      setError(getAuthErrorMessage(authError, language));
    } finally {
      setResetting(false);
    }
  };

  const activeClass = "bg-orange-500 text-white shadow-sm";
  const idleClass = "text-orange-500 hover:bg-white";

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-2">
      <section>
        <p className="font-bold text-orange-500">{t.welcome}</p>
        <h1 className="mt-2 text-4xl font-black leading-tight">{t.loginHeroTitle}</h1>
        <p className="mt-5 leading-8 text-stone-500">{t.loginHeroDesc}</p>
        <div className="mt-8 rounded-3xl bg-orange-50 p-6">
          <h2 className="font-black text-orange-600">{t.accountFeatures}</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">{t.accountFeaturesDesc}</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        {user ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-500">
              <User size={28} />
            </div>
            <h2 className="mt-4 text-2xl font-black">{t.loggedIn}</h2>
            <p className="mt-2 text-sm text-stone-500">{user.displayName || user.email}</p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
            >
              {t.backHome}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 rounded-full bg-orange-50 p-1">
              <button type="button" onClick={() => setMode("login")} className={`rounded-full py-3 text-sm font-bold transition ${mode === "login" ? activeClass : idleClass}`}>
                {t.login}
              </button>
              <button type="button" onClick={() => setMode("register")} className={`rounded-full py-3 text-sm font-bold transition ${mode === "register" ? activeClass : idleClass}`}>
                {t.signup}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
              {mode === "register" && (
                <label className="grid gap-2">
                  <span className="text-sm font-bold">{t.nickname}</span>
                  <div className="flex items-center rounded-2xl border border-orange-100 px-4 py-3 focus-within:border-orange-300">
                    <User size={18} className="text-orange-400" />
                    <input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      minLength={2}
                      placeholder="Haruka"
                      className="ml-3 w-full bg-transparent outline-none"
                    />
                  </div>
                </label>
              )}

              <label className="grid gap-2">
                <span className="text-sm font-bold">{t.email}</span>
                <div className="flex items-center rounded-2xl border border-orange-100 px-4 py-3 focus-within:border-orange-300">
                  <Mail size={18} className="text-orange-400" />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    required
                    placeholder="example@email.com"
                    className="ml-3 w-full bg-transparent outline-none"
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold">{t.password}</span>
                <div className="flex items-center rounded-2xl border border-orange-100 px-4 py-3 focus-within:border-orange-300">
                  <Lock size={18} className="text-orange-400" />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    required
                    minLength={6}
                    placeholder={t.passwordMin}
                    className="ml-3 w-full bg-transparent outline-none"
                  />
                </div>
              </label>

              {mode === "register" && (
                <>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold">{t.passwordConfirm}</span>
                    <div className="flex items-center rounded-2xl border border-orange-100 px-4 py-3 focus-within:border-orange-300">
                      <Lock size={18} className="text-orange-400" />
                      <input
                        value={passwordConfirm}
                        onChange={(event) => setPasswordConfirm(event.target.value)}
                        type="password"
                        required
                        minLength={6}
                        placeholder={t.passwordConfirmPlaceholder}
                        className="ml-3 w-full bg-transparent outline-none"
                      />
                    </div>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold">{t.recoveryQuestion}</span>
                    <select value={recoveryQuestion} onChange={(event) => setRecoveryQuestion(event.target.value)} className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300">
                      {recoveryQuestions.map((question) => <option key={question.id} value={question.id}>{recoveryQuestionName(question.id)}</option>)}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold">{t.recoveryAnswer}</span>
                    <input
                      value={recoveryAnswer}
                      onChange={(event) => setRecoveryAnswer(event.target.value)}
                      required
                      placeholder={t.recoveryAnswerPlaceholder}
                      className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300"
                    />
                  </label>
                </>
              )}

              {!firebaseReady && (
                <div className="flex gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{t.firebaseRequired}</p>
                </div>
              )}

              {error && (
                <div className="flex gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {success && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</p>}

              <button
                type="submit"
                disabled={submitting || !firebaseReady}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : mode === "register" ? <UserPlus size={18} /> : <LogIn size={18} />}
                {mode === "register" ? t.signupButton : t.loginButton}
              </button>
            </form>

            {mode === "login" && (
              <div className="mt-5 border-t border-orange-50 pt-5">
                <button type="button" onClick={() => setShowReset((value) => !value)} className="text-sm font-bold text-orange-500 hover:text-orange-600">
                  {t.forgotPassword}
                </button>
                {showReset && (
                  <form onSubmit={handleResetPassword} className="mt-4 grid gap-3">
                    <input
                      value={resetEmail}
                      onChange={(event) => setResetEmail(event.target.value)}
                      type="email"
                      required
                      placeholder={t.resetEmailPlaceholder}
                      className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300"
                    />
                    <p className="text-xs leading-5 text-stone-500">{t.resetNotice}</p>
                    <button disabled={resetting || !firebaseReady} className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 px-5 py-3 text-sm font-bold text-orange-500 hover:bg-orange-50 disabled:cursor-not-allowed disabled:text-stone-400">
                      {resetting && <Loader2 size={16} className="animate-spin" />}
                      {t.sendReset}
                    </button>
                  </form>
                )}
              </div>
            )}

            <p className="mt-5 text-center text-sm text-stone-500">
              {mode === "login" ? t.noAccountGuide : t.hasAccountGuide}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
