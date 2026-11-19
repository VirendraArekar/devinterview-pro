import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Password reset link generated');
    } catch {
      toast.error('Failed to dispatch reset request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-500">
            Enter your account email to receive a password recovery token.
          </p>
        </div>

        <Card className="p-6 space-y-4 shadow-lg">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Check Your Inbox
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                If an account exists for <strong>{email}</strong>, you will receive password reset instructions.
              </p>
              <Link to="/login">
                <Button variant="secondary" size="sm" className="mt-2">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@devinterview.pro"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full py-2.5 font-bold shadow-md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="pt-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
