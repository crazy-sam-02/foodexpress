import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { sendEmailVerification, reload } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const COOLDOWN_SECONDS = 60;
const STORAGE_KEY = 'fe_verification_email_last_sent_at';

export const EmailVerificationBanner = () => {
  const user = auth.currentUser;
  const [now, setNow] = useState(Date.now());
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const last = Number(localStorage.getItem(STORAGE_KEY) || '0');
    const diff = Math.max(0, COOLDOWN_SECONDS - Math.floor((now - last) / 1000));
    setCooldown(diff);
  }, [now]);

  if (!user || user.emailVerified) return null;

  const handleResend = async () => {
    try {
      const last = Number(localStorage.getItem(STORAGE_KEY) || '0');
      const secondsSince = Math.floor((Date.now() - last) / 1000);
      if (secondsSince < COOLDOWN_SECONDS) {
        toast.error(`Please wait ${COOLDOWN_SECONDS - secondsSince}s before resending`);
        return;
      }

      setIsSending(true);
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      } as const;
      await sendEmailVerification(user, actionCodeSettings);
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      toast.success('Verification email sent');
      try { await reload(user); } catch {}
    } catch (e) {
      toast.error('Failed to send verification email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="text-sm text-amber-900">
          Please verify your email to unlock all features. We sent a verification link to <strong>{user.email}</strong>.
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResend} disabled={isSending || cooldown > 0}>
            {isSending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Email'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;