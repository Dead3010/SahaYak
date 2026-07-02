  import { useQuery } from '@tanstack/react-query';
import { Mail, CheckCircle2, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function EmailSetup() {
  const [copied, setCopied] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.settings.get(),
  });

  const webhookUrl = data
    ? `${window.location.origin}${data.webhookPath}`
    : '';

  const copy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Email Setup</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure inbound email so customers can open tickets by sending an email.
        </p>
      </div>

      {/* Support address */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-500" />
            Support Email Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="h-9 bg-muted rounded animate-pulse" />
          ) : data?.supportEmail ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <code className="flex-1 text-sm bg-slate-50 border rounded px-3 py-2 font-mono">
                {data.supportEmail}
              </code>
              <button
                onClick={() => copy(data.supportEmail, 'email')}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1.5 rounded border hover:bg-muted transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copied === 'email' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                <code className="font-mono text-xs">SUPPORT_EMAIL</code> is not set in your environment.
                Add it to <code className="font-mono text-xs">.env</code> and restart the server.
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            This is the address customers will email to open a support ticket. Configure this address
            in SendGrid's Inbound Parse settings.
          </p>
        </CardContent>
      </Card>

      {/* Webhook URL */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-indigo-500" />
            SendGrid Webhook URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="h-9 bg-muted rounded animate-pulse" />
          ) : (
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-slate-50 border rounded px-3 py-2 font-mono break-all">
                {webhookUrl}
              </code>
              <button
                onClick={() => copy(webhookUrl, 'webhook')}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1.5 rounded border hover:bg-muted transition-colors shrink-0"
              >
                <Copy className="w-3 h-3" />
                {copied === 'webhook' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Paste this URL into SendGrid → Settings → Inbound Parse → Add Host & URL.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
