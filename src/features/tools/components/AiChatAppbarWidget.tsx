import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { AxiosError } from 'axios'

import {
  askSystemAi,
  clearAiConversation,
  getAiConversation,
  getAiConversations,
  type AiChatMessage,
  type AiConversation,
} from '../api/ai-chat.api'

type UiMessage = AiChatMessage & {
  id: string
  role: 'user' | 'assistant' | 'error'
}

function makeMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined
    const validationMessage = data?.errors ? Object.values(data.errors).flat()[0] : undefined

    return validationMessage || data?.message || 'تعذر التواصل مع مساعد النظام.'
  }

  if (error instanceof Error) return error.message

  return 'حدث خطأ غير متوقع.'
}

function toUiMessages(messages: AiChatMessage[]) {
  return messages.map<UiMessage>((message) => ({
    ...message,
    id: makeMessageId(),
  }))
}

export function AiChatAppbarWidget() {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const requestIdRef = useRef(0)

  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [conversations, setConversations] = useState<AiConversation[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const canSubmit = question.trim().length > 0 && !isSubmitting
  const hasConversation = Boolean(conversationId)

  const subtitle = useMemo(() => {
    if (!conversationId) return 'محادثة جديدة'

    return `محادثة #${conversationId}`
  }, [conversationId])

  useEffect(() => {
    if (!isOpen) return

    window.setTimeout(() => inputRef.current?.focus(), 80)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [isOpen, messages, isSubmitting])

  async function loadConversations() {
    setIsLoadingHistory(true)

    try {
      const data = await getAiConversations()
      setConversations(data)
    } catch {
      setConversations([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  async function openHistory() {
    const nextOpen = !isHistoryOpen
    setIsHistoryOpen(nextOpen)

    if (nextOpen) {
      await loadConversations()
    }
  }

  async function openConversation(nextConversationId: string) {
    setIsLoadingHistory(true)

    try {
      const conversation = await getAiConversation(nextConversationId)
      setConversationId(conversation.id)
      setMessages(toUiMessages(conversation.messages))
      setIsHistoryOpen(false)
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: makeMessageId(),
          role: 'error',
          content: getErrorMessage(error),
        },
      ])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  function startNewConversation() {
    requestIdRef.current += 1
    setConversationId(null)
    setMessages([])
    setQuestion('')
    setIsHistoryOpen(false)
  }

  async function clearCurrentConversation() {
    if (!conversationId || isClearing) return

    setIsClearing(true)

    try {
      await clearAiConversation(conversationId)
      setMessages([])
      await loadConversations()
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: makeMessageId(),
          role: 'error',
          content: getErrorMessage(error),
        },
      ])
    } finally {
      setIsClearing(false)
    }
  }

  async function submitQuestion(nextQuestion?: string) {
    const text = (nextQuestion ?? question).trim()
    if (!text || isSubmitting) return

    const activeRequestId = requestIdRef.current + 1
    requestIdRef.current = activeRequestId

    setQuestion('')
    setIsSubmitting(true)
    setIsHistoryOpen(false)

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: makeMessageId(),
        role: 'user',
        content: text,
      },
    ])

    try {
      const response = await askSystemAi(text, conversationId)

      if (requestIdRef.current !== activeRequestId) return

      if (response.conversationId) {
        setConversationId(response.conversationId)
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: makeMessageId(),
          role: response.success ? 'assistant' : 'error',
          content: response.answer || response.message || 'لم يصل جواب واضح من مساعد النظام.',
          createdAt: response.createdAt,
        },
      ])
    } catch (error) {
      if (requestIdRef.current !== activeRequestId) return

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: makeMessageId(),
          role: 'error',
          content: getErrorMessage(error),
        },
      ])
    } finally {
      if (requestIdRef.current === activeRequestId) {
        setIsSubmitting(false)
      }
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submitQuestion()
  }

  return (
    <div className="relative" dir="rtl">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#50683f]/15 bg-white text-[#50683f] shadow-sm transition hover:border-[#50683f]/30 hover:bg-[#eef4eb]"
        aria-label="مساعد النظام"
        title="مساعد النظام"
      >
        <RobotIcon />
        <span className="absolute -left-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
      </button>

      {isOpen ? (
        <section className="fixed left-4 right-4 top-20 z-50 flex h-[min(620px,calc(100vh-6rem))] flex-col overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white text-right shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:left-6 sm:right-auto sm:w-[390px]">
          <header className="border-b border-slate-100 bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef4eb] text-[#50683f]">
                  <RobotIcon className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-950">مساعد النظام</p>
                  <p className="text-[11px] font-bold text-slate-400">{subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={openHistory}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-[#50683f]"
                  aria-label="المحادثات"
                  title="المحادثات"
                >
                  <HistoryIcon />
                </button>

                <button
                  type="button"
                  onClick={startNewConversation}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-[#50683f]"
                  aria-label="محادثة جديدة"
                  title="محادثة جديدة"
                >
                  <PlusIcon />
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                  aria-label="إغلاق"
                  title="إغلاق"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
          </header>

          {isHistoryOpen ? (
            <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-black text-slate-700">المحادثات السابقة</p>
                <button
                  type="button"
                  onClick={loadConversations}
                  className="text-[11px] font-black text-[#50683f]"
                  disabled={isLoadingHistory}
                >
                  تحديث
                </button>
              </div>

              <div className="max-h-40 space-y-2 overflow-y-auto">
                {isLoadingHistory ? (
                  <p className="rounded-2xl bg-white px-3 py-3 text-center text-xs font-bold text-slate-400">جاري التحميل...</p>
                ) : conversations.length === 0 ? (
                  <p className="rounded-2xl bg-white px-3 py-3 text-center text-xs font-bold text-slate-400">لا توجد محادثات محفوظة.</p>
                ) : (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => openConversation(conversation.id)}
                      className="block w-full rounded-2xl bg-white px-3 py-2 text-right transition hover:bg-[#eef4eb]"
                    >
                      <span className="block truncate text-xs font-black text-slate-800">{conversation.title}</span>
                      <span className="mt-0.5 block text-[11px] font-bold text-slate-400">
                        {conversation.messagesCount} رسائل
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/70 px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div className="max-w-xs">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[#eef4eb] text-[#50683f]">
                    <RobotIcon className="h-7 w-7" />
                  </span>
                  <p className="mt-3 text-sm font-black text-slate-900">اسأل عن بيانات النظام</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    اكتب سؤالك عن المشاريع أو البنود. إذا لم توجد محادثة، سيتم إنشاؤها تلقائياً عند أول رسالة.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => <ChatBubble key={message.id} message={message} />)
            )}

            {isSubmitting ? <TypingBubble /> : null}
          </div>

          <div className="border-t border-slate-100 bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={clearCurrentConversation}
                disabled={!hasConversation || isClearing}
                className="text-[11px] font-black text-slate-400 transition hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                مسح رسائل المحادثة
              </button>

              <p className="text-[11px] font-bold text-slate-400">متصل بقاعدة بيانات النظام</p>
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                disabled={isSubmitting}
                placeholder="اكتب سؤالك..."
                className="h-11 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#50683f] text-white shadow-sm transition hover:bg-[#425734] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="إرسال"
                title="إرسال"
              >
                <SendIcon />
              </button>
            </form>
          </div>
        </section>
      ) : null}
    </div>
  )
}

function ChatBubble({ message }: { message: UiMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[86%] whitespace-pre-wrap rounded-3xl rounded-bl-lg border border-[#50683f]/20 bg-[#eef4eb] px-4 py-3 text-sm font-bold leading-7 text-slate-800 shadow-sm">
          {message.content}
        </div>
      </div>
    )
  }

  if (message.role === 'error') {
    return (
      <div className="flex justify-start">
        <div className="max-w-[92%] whitespace-pre-wrap rounded-3xl rounded-br-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold leading-7 text-rose-700 shadow-sm">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] whitespace-pre-wrap rounded-3xl rounded-br-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold leading-7 text-slate-700 shadow-sm">
        {message.content}
      </div>
    </div>
  )
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-3xl rounded-br-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#50683f]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#50683f] [animation-delay:120ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#50683f] [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  )
}

function RobotIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v3" strokeLinecap="round" />
      <path d="M8 6h8a4 4 0 0 1 4 4v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5a4 4 0 0 1 4-4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13h.01M15 13h.01" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 17h5" strokeLinecap="round" />
      <path d="M4 12H2M22 12h-2" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg className="h-5 w-5 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 7h16M4 12h12M4 17h8" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}
