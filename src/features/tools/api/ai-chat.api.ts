import { api } from '@/lib/axios'

export interface AiChatMessage {
  role: 'user' | 'assistant'
  content: string
  createdAt?: string | null
}

export interface AiConversation {
  id: string
  title: string
  messagesCount: number
  createdAt?: string | null
}

export interface AiConversationDetails {
  id: string
  title: string
  messages: AiChatMessage[]
}

export interface AiChatResult {
  success: boolean
  message?: string
  conversationId?: string
  question: string
  answer: string
  createdAt?: string | null
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function getData(payload: unknown) {
  if (!isRecord(payload)) return {}

  return isRecord(payload.data) ? payload.data : payload
}

function toStringValue(value: unknown, fallback = '') {
  if (value === null || value === undefined) return fallback

  return String(value)
}

function toOptionalString(value: unknown) {
  if (value === null || value === undefined || String(value).trim() === '') return undefined

  return String(value)
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string' && value.trim() !== '') {
    const numericValue = Number(value)
    if (Number.isFinite(numericValue)) return numericValue
  }

  return fallback
}

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function mapMessage(value: unknown): AiChatMessage {
  const item = isRecord(value) ? value : {}

  return {
    role: item.role === 'user' ? 'user' : 'assistant',
    content: toStringValue(item.content ?? item.message ?? item.answer),
    createdAt: toOptionalString(item.created_at ?? item.createdAt) ?? null,
  }
}

function mapConversation(value: unknown): AiConversation {
  const item = isRecord(value) ? value : {}

  return {
    id: toStringValue(item.id),
    title: toStringValue(item.title, 'محادثة بدون عنوان'),
    messagesCount: toNumber(item.messages_count ?? item.messagesCount),
    createdAt: toOptionalString(item.created_at ?? item.createdAt) ?? null,
  }
}

function normalizeChatResult(payload: unknown): AiChatResult {
  const root = isRecord(payload) ? payload : {}
  const data = getData(payload)

  return {
    success: typeof root.success === 'boolean' ? root.success : true,
    message: toOptionalString(root.message ?? data.message),
    conversationId: toOptionalString(data.conversation_id ?? data.conversationId ?? data.id),
    question: toStringValue(data.question),
    answer: toStringValue(data.answer ?? data.response ?? data.message),
    createdAt: toOptionalString(data.created_at ?? data.createdAt) ?? null,
  }
}

export async function askSystemAi(question: string, conversationId?: string | null): Promise<AiChatResult> {
  const params: Record<string, string> = {
    question,
  }

  if (conversationId && conversationId.trim() !== '') {
    params.conversation_id = conversationId
  }

  const response = await api.post<unknown>('/ai/chat', null, {
    params,
    headers: {
      Accept: 'application/json',
    },
  })

  return normalizeChatResult(response.data)
}

export async function getAiConversations(): Promise<AiConversation[]> {
  const response = await api.get<unknown>('/ai/conversations')
  const data = getData(response.data)
  const conversations = Array.isArray(data) ? data : readArray(data.conversations ?? data.data)

  return conversations.map(mapConversation)
}

export async function getAiConversation(conversationId: string): Promise<AiConversationDetails> {
  const response = await api.get<unknown>(`/ai/conversations/${conversationId}`)
  const data = getData(response.data)

  return {
    id: toStringValue(data.id, conversationId),
    title: toStringValue(data.title, 'محادثة بدون عنوان'),
    messages: readArray(data.messages).map(mapMessage),
  }
}

export async function clearAiConversation(conversationId: string): Promise<void> {
  await api.delete('/ai/clear', {
    params: {
      conversation_id: conversationId,
    },
  })
}

export async function deleteAiConversation(conversationId: string): Promise<void> {
  await api.delete(`/ai/conversations/${conversationId}`)
}
