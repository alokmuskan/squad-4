import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardNavbar from "@/features/dashboard/components/dashboard-navbar";
import {
  getChatSessions,
  getSessionMessages,
  sendChatMessage,
  createChatSession,
  deleteChatSession,
} from "@/services/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface Session {
  id: string;
  title: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
}

interface FileAttachment {
  file: File;
  base64: string;
  preview: string;
}

export default function ChatbotPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (attachment && activeSessionId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [attachment, activeSessionId]);

  async function loadSessions() {
    setLoadingSessions(true);
    try {
      const data = await getChatSessions();
      setSessions(data.sessions || []);
    } catch {
      console.error("Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  }

  async function loadMessages(sessionId: string) {
    setActiveSessionId(sessionId);
    try {
      const data = await getSessionMessages(sessionId);
      setMessages(data.messages || []);
    } catch {
      console.error("Failed to load messages");
    }
    if (window.innerWidth < 768) setShowSidebar(false);
  }

  async function handleNewSession() {
    try {
      const session = await createChatSession();
      setSessions((prev) => [
        { id: session.id, title: session.title, messageCount: 0, lastMessageAt: session.createdAt, createdAt: session.createdAt },
        ...prev,
      ]);
      setActiveSessionId(session.id);
      setMessages([]);
      inputRef.current?.focus();
    } catch {
      console.error("Failed to create session");
    }
    if (window.innerWidth < 768) setShowSidebar(false);
  }

  async function handleDeleteSession(e: React.MouseEvent, sessionId: string) {
    e.stopPropagation();
    try {
      await deleteChatSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch {
      console.error("Failed to delete session");
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("File size must be under 15MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAttachment({
        file,
        base64: result,
        preview: file.type.startsWith("image/") ? result : "",
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function removeAttachment() {
    setAttachment(null);
  }

  async function handleSend() {
    const text = input.trim();
    if ((!text && !attachment) || !activeSessionId || sending) return;

    const contentToSend = text || (attachment ? `Here is a file: ${attachment.file.name}` : "");
    const fileData = attachment
      ? { base64: attachment.base64, mimeType: attachment.file.type, fileName: attachment.file.name }
      : null;

    setInput("");
    setAttachment(null);
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const displayContent = fileData
      ? `${contentToSend}\n\n[Attached: ${fileData.fileName}]`
      : contentToSend;
    const userMsg: Message = {
      id: tempId,
      role: "user",
      content: displayContent,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const result = await sendChatMessage(activeSessionId, contentToSend, fileData);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? result.message : m)).concat(result.reply),
      );
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messageCount: s.messageCount + 2, lastMessageAt: result.reply.createdAt }
            : s,
        ),
      );
    } catch {
      setMessages((prev) =>
        prev.concat({
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I'm having trouble responding right now. Please try again.",
          createdAt: new Date().toISOString(),
        }),
      );
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getFileIcon = (mime: string) => {
    if (mime.includes("pdf")) return "📄";
    if (mime.includes("image")) return "🖼️";
    if (mime.includes("text") || mime.includes("json")) return "📝";
    return "📎";
  };

  return (
    <div className="min-h-screen bg-[#F8F6E8] flex flex-col">
      <DashboardNavbar />

      <div className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 73px)" }}>
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-100">
                <button
                  onClick={handleNewSession}
                  className="w-full py-3 bg-[#171C4A] text-white rounded-2xl font-bold hover:opacity-90 transition"
                >
                  + New Chat
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loadingSessions ? (
                  <div className="text-center text-gray-400 py-8 text-sm">Loading...</div>
                ) : sessions.length === 0 ? (
                  <div className="text-center text-gray-400 py-8 text-sm">No conversations yet</div>
                ) : (
                  sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => loadMessages(session.id)}
                      className={`w-full text-left px-4 py-3 rounded-2xl transition flex items-start justify-between gap-2 ${
                        activeSessionId === session.id
                          ? "bg-[#171C4A] text-white"
                          : "hover:bg-[#F8F6E8] text-gray-700"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{session.title}</p>
                        <p className={`text-xs mt-0.5 ${activeSessionId === session.id ? "text-white/60" : "text-gray-400"}`}>
                          {session.messageCount} messages
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className={`p-1 rounded-full hover:bg-black/10 shrink-0 ${
                          activeSessionId === session.id ? "text-white/60 hover:text-white" : "text-gray-300 hover:text-red-500"
                        }`}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </button>
                  ))
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 bg-white/50">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-[#171C4A]">
              {activeSessionId
                ? sessions.find((s) => s.id === activeSessionId)?.title || "Chat"
                : "AI Career Coach"}
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
            {!activeSessionId ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-[#171C4A] rounded-3xl flex items-center justify-center text-4xl mb-6">
                  🤖
                </div>
                <h2 className="text-2xl font-black text-[#171C4A] mb-2">AI Career Coach</h2>
                <p className="text-gray-500 max-w-md mb-8">
                  Your personal career guide. Ask for advice on skill gaps, interview prep, learning paths, and more.
                  Upload your resume, projects, or notes for personalized feedback.
                </p>
                <div className="grid md:grid-cols-2 gap-3 max-w-lg w-full">
                  {[
                    "What skills should I learn next?",
                    "How do I prepare for technical interviews?",
                    "Create a study plan for me",
                    "Review my career progress",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        handleNewSession().then(() => {
                          setTimeout(() => {
                            setInput(prompt);
                            inputRef.current?.focus();
                          }, 300);
                        });
                      }}
                      className="text-left px-4 py-3 bg-white rounded-2xl border border-gray-200 hover:border-[#171C4A] hover:shadow-md transition text-sm text-gray-600 hover:text-[#171C4A]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Start a conversation by sending a message below. You can also attach files (PDFs, images, text) for analysis.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-3xl px-5 py-3 ${
                      msg.role === "user"
                        ? "bg-[#171C4A] text-white rounded-br-lg"
                        : "bg-white border border-gray-200 rounded-bl-lg"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                    </div>
                    <p
                      className={`text-xs mt-2 ${
                        msg.role === "user" ? "text-white/50" : "text-gray-400"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </motion.div>
              ))
            )}

            {sending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-gray-200 rounded-3xl rounded-bl-lg px-5 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 bg-white px-4 md:px-8 py-4">
            <div className="max-w-4xl mx-auto">
              {attachment && (
                <div className="mb-3 flex items-center gap-3 bg-[#F8F6E8] px-4 py-2.5 rounded-2xl">
                  <span className="text-lg">{getFileIcon(attachment.file.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{attachment.file.name}</p>
                    <p className="text-xs text-gray-400">{(attachment.file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  {attachment.preview && (
                    <img src={attachment.preview} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <button
                    onClick={removeAttachment}
                    className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-red-500 transition"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex items-end gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!activeSessionId || sending}
                  className="p-3.5 bg-[#F8F6E8] text-gray-500 rounded-2xl hover:bg-gray-200 transition disabled:opacity-30 shrink-0"
                  title="Attach file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.json,.md,.csv,.png,.jpg,.jpeg,.gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      !activeSessionId
                        ? "Create a new chat to begin..."
                        : attachment
                          ? "Ask about the attached file..."
                          : "Ask your career coach anything... (or attach a file)"
                    }
                    disabled={!activeSessionId || sending}
                    className="w-full px-5 py-3.5 bg-[#F8F6E8] rounded-2xl border border-gray-200 focus:border-[#171C4A] focus:ring-2 focus:ring-[#171C4A]/10 outline-none text-sm transition disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!activeSessionId || (!input.trim() && !attachment) || sending}
                  className="p-3.5 bg-[#171C4A] text-white rounded-2xl hover:opacity-90 transition disabled:opacity-30 shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: string[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("## ")) {
      if (inList) {
        elements.push(<ul key={`ul-${i}`} className="list-disc pl-5 space-y-1 my-2">{listItems.map((item, j) => <li key={j}>{item}</li>)}</ul>);
        listItems = [];
        inList = false;
      }
      elements.push(<h2 key={i} className="text-lg font-bold text-[#171C4A] mt-4 mb-2">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith("### ")) {
      if (inList) {
        elements.push(<ul key={`ul-${i}`} className="list-disc pl-5 space-y-1 my-2">{listItems.map((item, j) => <li key={j}>{item}</li>)}</ul>);
        listItems = [];
        inList = false;
      }
      elements.push(<h3 key={i} className="text-base font-bold text-[#171C4A] mt-3 mb-1">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(trimmed.slice(2));
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      if (inList) {
        elements.push(<ul key={`ul-${i}`} className="list-disc pl-5 space-y-1 my-2">{listItems.map((item, j) => <li key={j}>{item}</li>)}</ul>);
        listItems = [];
        inList = false;
      }
      elements.push(<p key={i} className="font-bold">{trimmed.slice(2, -2)}</p>);
    } else if (trimmed === "") {
      if (inList) {
        elements.push(<ul key={`ul-${i}`} className="list-disc pl-5 space-y-1 my-2">{listItems.map((item, j) => <li key={j}>{item}</li>)}</ul>);
        listItems = [];
        inList = false;
      }
    } else {
      if (inList) {
        elements.push(<ul key={`ul-${i}`} className="list-disc pl-5 space-y-1 my-2">{listItems.map((item, j) => <li key={j}>{item}</li>)}</ul>);
        listItems = [];
        inList = false;
      }
      elements.push(<p key={i} className="mb-1">{trimmed}</p>);
    }
  });

  if (inList) {
    elements.push(<ul key="ul-final" className="list-disc pl-5 space-y-1 my-2">{listItems.map((item, j) => <li key={j}>{item}</li>)}</ul>);
  }

  return elements.length > 0 ? <div>{elements}</div> : <p>{text}</p>;
}
