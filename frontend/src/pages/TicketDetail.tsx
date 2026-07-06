import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Sparkles, FileText, MessageSquarePlus, Bot, Mail, Trash2, Pencil, SlidersHorizontal, X, Lock, Mic, MicOff } from 'lucide-react';
import { api } from '../lib/api';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../components/StatusBadge';
import { TICKET_STATUSES, TICKET_CATEGORIES, formatStatus, formatCategory } from '../lib/constants';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [replyBody, setReplyBody] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [error, setError] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commentError, setCommentError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: '', category: '', assignedToId: '', priority: '' });
  const [showUpdate, setShowUpdate] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  const { data, isLoading: loading, isError, error: queryError } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.tickets.get(id!),
    enabled: !!id,
    retry: false,
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.list(),
  });

  const ticket = data?.ticket ?? null;

  useEffect(() => {
    if (ticket) {
      setUpdateForm({ status: ticket.status, category: ticket.category, assignedToId: ticket.assignedTo?.id ?? '', priority: ticket.priority });
    }
  }, [ticket]);

  useEffect(() => {
    setSpeechSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }, []);

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    // Single-utterance mode: Chrome gives exactly ONE final transcript per session.
    // We restart manually between utterances, which eliminates the overlap/duplication
    // that continuous: true causes (it re-fires cumulative phrases as finals).
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const result = event.results[0];
      const transcript = result[0].transcript;
      if (result.isFinal) {
        setReplyBody((prev) => {
          const sep = prev && !prev.endsWith(' ') ? ' ' : '';
          return prev + sep + transcript.trim() + ' ';
        });
        setInterimText('');
      } else {
        setInterimText(transcript);
      }
    };

    recognition.onend = () => {
      setInterimText('');
      if (isListeningRef.current) {
        // Start a fresh instance — previous session's results are gone, no duplication
        startListening();
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      // 'no-speech' is non-fatal — onend fires next and we restart
      if (event.error === 'not-allowed') {
        isListeningRef.current = false;
        setIsListening(false);
        setInterimText('');
      }
    };

    recognitionRef.current = recognition;
    // Only set state on the first call — recursive restarts skip this
    if (!isListeningRef.current) {
      isListeningRef.current = true;
      setIsListening(true);
    }
    recognition.start();
  };

  const stopListening = () => {
    // Set ref first so onend doesn't restart
    isListeningRef.current = false;
    setIsListening(false);
    setInterimText('');
    recognitionRef.current?.abort();
    recognitionRef.current = null;
  };

  const invalidate = () => qc.invalidateQueries({ queryKey: ['ticket', id] });

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<{ status: string; category: string; assignedToId: string | null }>) =>
      api.tickets.update(id!, patch),
    onSuccess: () => { invalidate(); setShowUpdate(false); },
  });

  const classifyMutation = useMutation({ mutationFn: () => api.tickets.classify(id!), onSuccess: invalidate });
  const summarizeMutation = useMutation({ mutationFn: () => api.tickets.summarize(id!), onSuccess: invalidate });
  const suggestReplyMutation = useMutation({
    mutationFn: () => api.tickets.suggestReply(id!),
    onSuccess: ({ ticket: t }) => { invalidate(); setReplyBody(t.suggestedReply || ''); },
  });
  const deleteMutation = useMutation({
    mutationFn: () => api.tickets.delete(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tickets'] }); navigate('/tickets'); },
  });
  const replyMutation = useMutation({
    mutationFn: ({ body, sendEmail }: { body: string; sendEmail: boolean }) =>
      api.tickets.addReply(id!, body, sendEmail),
    onSuccess: () => { setReplyBody(''); setSendEmail(false); setError(''); invalidate(); },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed to send reply'),
  });
  const commentMutation = useMutation({
    mutationFn: (body: string) => api.tickets.addComment(id!, body),
    onSuccess: () => { setCommentBody(''); setCommentError(''); invalidate(); },
    onError: (e) => setCommentError(e instanceof Error ? e.message : 'Failed to save comment'),
  });

  const aiLoading =
    classifyMutation.isPending ? 'classify' :
    summarizeMutation.isPending ? 'summarize' :
    suggestReplyMutation.isPending ? 'suggest-reply' : null;

  const runAI = (action: 'classify' | 'summarize' | 'suggest-reply') => {
    setError('');
    if (action === 'classify') classifyMutation.mutate();
    else if (action === 'summarize') summarizeMutation.mutate();
    else suggestReplyMutation.mutate();
  };

  const aiError = (classifyMutation.error ?? summarizeMutation.error ?? suggestReplyMutation.error)?.message;

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-6 w-24 bg-slate-100 rounded-lg animate-pulse" />
        <div className="h-48 bg-white rounded-2xl border border-slate-100 animate-pulse" />
        <div className="h-36 bg-white rounded-2xl border border-slate-100 animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3 animate-fade-in">
        <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')} className="text-slate-500 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tickets
        </Button>
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {(queryError as Error)?.message === 'Ticket not found'
            ? 'This ticket does not exist.'
            : `Failed to load ticket: ${(queryError as Error)?.message}`}
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const comments = ticket.replies?.filter((r) => r.isInternal) ?? [];
  const replies = ticket.replies?.filter((r) => !r.isInternal) ?? [];

  return (
    <div className="animate-fade-in">
      {/* Delete dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold">Delete Ticket</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Are you sure you want to delete this ticket? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-full">Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="rounded-full">
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Back + delete row — full width above the grid */}
      <div className="flex items-center justify-between mb-5">
        <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')}
          className="text-slate-500 hover:text-slate-800 -ml-2 transition-colors duration-150">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tickets
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}
          className="rounded-full text-xs font-semibold transition-all duration-150">
          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
        </Button>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* LEFT column */}
        <div className="space-y-5">

          {/* Header card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap mb-2">
                  <h1 className="text-lg font-bold text-slate-900 leading-snug">{ticket.subject}</h1>
                  {showUpdate ? (
                    <button onClick={() => setShowUpdate(false)}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 hover:bg-slate-50 transition-all duration-150">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  ) : (
                    <button onClick={() => setShowUpdate(true)}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all duration-150">
                      <Pencil className="w-3 h-3" /> Update
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  From <span className="font-semibold text-slate-700">{ticket.fromName}</span>
                  {' · '}
                  <a href={`mailto:${ticket.fromEmail}`} className="hover:text-blue-600 transition-colors duration-150">
                    {ticket.fromEmail}
                  </a>
                  {' · '}
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                {ticket.aiResolved && (
                  <Badge className="text-[10px] h-5 px-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                    <Bot className="w-3 h-3" /> Auto-resolved
                  </Badge>
                )}
                <PriorityBadge priority={ticket.priority} />
                <CategoryBadge category={ticket.category} />
                <StatusBadge status={ticket.status} />
              </div>
            </div>

            {/* Body */}
            <div className="mt-5 bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {ticket.body}
            </div>

          </div>

          {/* AI Tools */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-bold text-slate-800">AI Tools</h2>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { action: 'classify' as const, label: 'Classify', loadingLabel: 'Classifying…', icon: FileText, style: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
                  { action: 'summarize' as const, label: 'Summarize', loadingLabel: 'Summarizing…', icon: FileText, style: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
                  { action: 'suggest-reply' as const, label: 'Suggest Reply', loadingLabel: 'Generating…', icon: MessageSquarePlus, style: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
                ].map(({ action, label, loadingLabel, icon: Icon, style }) => (
                  <button key={action} onClick={() => runAI(action)} disabled={!!aiLoading}
                    className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border font-semibold transition-all duration-150 disabled:opacity-50 ${style}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {aiLoading === action ? loadingLabel : label}
                  </button>
                ))}
              </div>

              {aiError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-3 animate-fade-in">
                  {aiError}
                </div>
              )}

              {ticket.summary && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-3.5 h-3.5 text-blue-500" />
                    <p className="text-xs font-bold text-slate-600">AI Summary</p>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{ticket.summary}</p>
                </div>
              )}
            </div>
          </div>

          {/* Replies */}
          {replies.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4">
                Replies
                <span className="ml-2 text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {replies.length}
                </span>
              </h2>
              <div className="space-y-3">
                {replies.map((reply) => (
                  <div key={reply.id}
                    className={`rounded-xl px-4 py-4 text-sm border ${
                      reply.isAI ? 'bg-blue-50/60 border-blue-100' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        reply.isAI ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {reply.isAI ? <Bot className="w-3 h-3" /> : (reply.author?.name?.charAt(0) || 'A')}
                      </div>
                      <span className="font-semibold text-slate-700 text-xs">{reply.author?.name || 'Agent'}</span>
                      {reply.isAI && (
                        <Badge className="text-[10px] h-4 px-2 rounded-full bg-blue-100 text-blue-700 border-0 font-semibold hover:bg-blue-100">AI</Badge>
                      )}
                      {reply.sentViaEmail && (
                        <Badge className="text-[10px] h-4 px-2 rounded-full bg-emerald-100 text-emerald-700 border-0 font-semibold hover:bg-emerald-100 flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5" /> Sent
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">{new Date(reply.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{reply.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write reply */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Write a Reply</h2>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-3 animate-fade-in">
                {error}
              </div>
            )}
            <Textarea
              rows={5}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Type your reply here…"
              className={`resize-none bg-slate-50 border-slate-200 focus:bg-white transition-all duration-150 rounded-xl ${
                isListening ? 'border-red-300 focus:border-red-400 ring-2 ring-red-100' : 'focus:border-blue-400'
              }`}
            />
            {interimText && (
              <p className="mt-1.5 px-3 text-xs text-slate-400 italic animate-pulse">
                {interimText}…
              </p>
            )}
            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer select-none hover:text-slate-700 transition-colors duration-150">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded border-slate-300 accent-blue-600"
                />
                <Mail className="w-3.5 h-3.5" />
                Send via email to customer
              </label>
              <div className="flex items-center gap-2">
                {speechSupported && (
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    title={isListening ? 'Stop recording' : 'Speak your reply'}
                    className={`relative flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150 ${
                      isListening
                        ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-200'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-red-300 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <span className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-ping" />
                        <MicOff className="w-3.5 h-3.5 relative" />
                        <span className="relative">Stop</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        Speak
                      </>
                    )}
                  </button>
                )}
                <Button
                  onClick={() => replyMutation.mutate({ body: replyBody, sendEmail })}
                  disabled={replyMutation.isPending || !replyBody.trim()}
                  size="sm"
                  className="rounded-full font-semibold px-5 transition-all duration-150"
                >
                  {replyMutation.isPending ? 'Sending…' : sendEmail ? 'Send Reply' : 'Save Reply'}
                </Button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT column — Comments sidebar */}
        <div className="lg:sticky lg:top-6 space-y-3">

          {/* Update form */}
          {showUpdate && (
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 animate-fade-in">
              <div className="flex items-center gap-1.5 mb-3">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-bold text-blue-700">Update Details</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Status</p>
                  <Select value={updateForm.status} onValueChange={(v) => setUpdateForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger className="h-9 text-sm w-full bg-white rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {TICKET_STATUSES.map((s) => <SelectItem key={s} value={s}>{formatStatus(s)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Category</p>
                  <Select value={updateForm.category} onValueChange={(v) => setUpdateForm((f) => ({ ...f, category: v }))}>
                    <SelectTrigger className="h-9 text-sm w-full bg-white rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {TICKET_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{formatCategory(c)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Priority</p>
                  <Select value={updateForm.priority} onValueChange={(v) => setUpdateForm((f) => ({ ...f, priority: v }))}>
                    <SelectTrigger className="h-9 text-sm w-full bg-white rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="URGENT">🔴 Urgent</SelectItem>
                      <SelectItem value="HIGH">🟠 High</SelectItem>
                      <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                      <SelectItem value="LOW">⚪ Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Assigned to</p>
                  <Select
                    value={updateForm.assignedToId || 'unassigned'}
                    onValueChange={(v) => setUpdateForm((f) => ({ ...f, assignedToId: v === 'unassigned' ? '' : v }))}
                  >
                    <SelectTrigger className="h-9 text-sm w-full bg-white rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {(usersData?.users ?? []).map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button size="sm" className="rounded-full font-semibold px-5 transition-all duration-150"
                  onClick={() => updateMutation.mutate({
                    status: updateForm.status,
                    category: updateForm.category,
                    priority: updateForm.priority,
                    assignedToId: updateForm.assignedToId || null,
                  })}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}

          {/* Add comment card */}
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-800">Comments</h2>
              <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold ml-auto">
                Internal only
              </span>
            </div>

            {/* Existing comments */}
            {comments.length > 0 && (
              <div className="space-y-2 mb-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-xl px-3 py-3 text-sm border bg-amber-50/60 border-amber-200">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                        {comment.author?.name?.charAt(0) || 'A'}
                      </div>
                      <span className="font-semibold text-slate-700 text-xs">{comment.author?.name || 'Agent'}</span>
                      <span className="text-[10px] text-slate-400 ml-auto shrink-0">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-xs">{comment.body}</p>
                  </div>
                ))}
              </div>
            )}

            {commentError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-2 animate-fade-in">
                {commentError}
              </div>
            )}

            <Textarea
              rows={3}
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Leave an internal note for your team…"
              className="resize-none bg-amber-50/40 border-amber-200 focus:bg-white focus:border-amber-400 transition-all duration-150 rounded-xl text-sm"
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={() => commentMutation.mutate(commentBody)}
                disabled={commentMutation.isPending || !commentBody.trim()}
                size="sm"
                className="rounded-full font-semibold px-4 text-xs transition-all duration-150"
              >
                {commentMutation.isPending ? 'Saving…' : 'Save Comment'}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
