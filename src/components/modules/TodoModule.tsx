import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Plus, Trash2, Circle, CheckCircle2 } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { generateId } from '../../utils'
import type { TodoItem } from '../../types'

export default function TodoModule() {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('todos', [])
  const [input, setInput] = useState('')

  const addTodo = () => {
    if (!input.trim()) return
    setTodos((prev) => [
      {
        id: generateId(),
        text: input.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    setInput('')
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed))
  }

  const completedCount = todos.filter((t) => t.completed).length

  return (
    <GlassCard id="todo" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare size={16} className="text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            今日待办
          </h2>
          {todos.length > 0 && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {completedCount}/{todos.length}
            </span>
          )}
        </div>
        {completedCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCompleted}>
            清除已完成
          </Button>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="添加新任务..."
          className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-claude-400/40 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
        />
        <Button variant="primary" size="sm" onClick={addTodo}>
          <Plus size={13} />
        </Button>
      </div>

      {/* Progress bar */}
      {todos.length > 0 && (
        <div className="mb-3 h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-claude-500"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / todos.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Todo list */}
      <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {todos.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-zinc-400 dark:text-zinc-600 py-6"
            >
              暂无待办事项 ✨
            </motion.p>
          )}
          {todos.map((todo) => (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 group rounded-xl px-2 py-1.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className="flex-shrink-0 text-zinc-400 hover:text-claude-500 transition-colors"
              >
                {todo.completed ? (
                  <CheckCircle2 size={16} className="text-claude-500" />
                ) : (
                  <Circle size={16} />
                )}
              </button>
              <span
                className={[
                  'flex-1 text-sm transition-all',
                  todo.completed
                    ? 'line-through text-zinc-400 dark:text-zinc-600'
                    : 'text-zinc-700 dark:text-zinc-200',
                ].join(' ')}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-400 dark:text-zinc-600 dark:hover:text-red-400 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  )
}
