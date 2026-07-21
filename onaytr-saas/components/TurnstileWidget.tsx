"use client";

import { useEffect, useRef, useState } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    turnstile: any;
    onTurnstileLoad: () => void;
  }
}

export default function TurnstileWidget({ onVerify, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  // Fetch site key from DB via API
  useEffect(() => {
    fetch('/api/auth/turnstile-key')
      .then(res => res.json())
      .then(data => {
        if (data.siteKey) {
          setSiteKey(data.siteKey);
        } else {
          // Fallback: test key
          setSiteKey('1x00000000000000000000AA');
        }
      })
      .catch(() => {
        setSiteKey('1x00000000000000000000AA');
      });
  }, []);

  // Load Turnstile script
  useEffect(() => {
    if (!siteKey) return;

    if (window.turnstile) {
      setScriptReady(true);
      return;
    }

    window.onTurnstileLoad = () => {
      setScriptReady(true);
    };

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
      }
    };
  }, [siteKey]);

  // Render widget when both key and script are ready
  useEffect(() => {
    if (!scriptReady || !siteKey || !containerRef.current || !window.turnstile) return;
    
    // Clean up old widget
    if (widgetIdRef.current) {
      try { window.turnstile.remove(widgetIdRef.current); } catch {}
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => {
        onVerify(token);
      },
      'expired-callback': () => {
        onExpire?.();
      },
      theme: 'light',
      language: 'tr',
    });
  }, [scriptReady, siteKey]);

  if (!siteKey) return null;

  return (
    <div ref={containerRef} className="flex justify-center my-2" />
  );
}
