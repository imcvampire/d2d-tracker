import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback, useRef, forwardRef } from 'react'
import { Plus, Minus, Pencil, Trash2, Heart, Swords, Shield, Check, SkipForward, RotateCcw, Skull } from 'lucide-react'
import { Button } from '@/components/ui/8bit/button'
import { Input } from '@/components/ui/8bit/input'
import { Label } from '@/components/ui/8bit/label'
import { Checkbox } from '@/components/ui/8bit/checkbox'
import { Badge } from '@/components/ui/8bit/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/8bit/dialog'
import { Kbd } from '@/components/ui/8bit/kbd'

export const Route = createFileRoute('/combat')({ component: CombatTracker })

interface Entity {
  id: string
  name: string
  health: number
  maxHealth: number
  initiative: number
  statuses: string[]
}

const STATUS_OPTIONS = [
  'Poisoned',
  'Stunned',
  'Blessed',
  'Cursed',
  'Burning',
  'Frozen',
  'Paralyzed',
  'Invisible',
  'Hasted',
  'Slowed',
]

function CombatTracker() {
  const [entities, setEntities] = useState<Entity[]>([
    {
      id: '1',
      name: 'Hero',
      health: 45,
      maxHealth: 50,
      initiative: 18,
      statuses: ['Blessed'],
    },
    {
      id: '2',
      name: 'Goblin',
      health: 12,
      maxHealth: 15,
      initiative: 14,
      statuses: ['Poisoned'],
    },
    {
      id: '3',
      name: 'Drago',
      health: 200,
      maxHealth: 200,
      initiative: 20,
      statuses: [],
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [newEntity, setNewEntity] = useState<Omit<Entity, 'id'>>({
    name: '',
    health: 10,
    maxHealth: 10,
    initiative: 10,
    statuses: [],
  })

  const sortedEntities = [...entities].sort((a, b) => b.initiative - a.initiative)

  // Refs to track entity card elements for scrolling
  const entityRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Scroll active entity into view when turn changes
  useEffect(() => {
    if (sortedEntities.length === 0) return
    const activeEntity = sortedEntities[currentTurnIndex]
    if (!activeEntity) return

    const element = entityRefs.current.get(activeEntity.id)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [currentTurnIndex, sortedEntities])

  const nextTurn = useCallback(() => {
    if (sortedEntities.length === 0) return
    const nextIndex = currentTurnIndex + 1
    if (nextIndex >= sortedEntities.length) {
      setCurrentTurnIndex(0)
      setCurrentRound((r) => r + 1)
    } else {
      setCurrentTurnIndex(nextIndex)
    }
  }, [sortedEntities.length, currentTurnIndex])

  const resetCombat = useCallback(() => {
    setCurrentTurnIndex(0)
    setCurrentRound(1)
    // Clear statuses but keep current HP
    setEntities(entities.map((e) => ({
      ...e,
      statuses: [],
    })))
  }, [entities])

  const openAddForm = useCallback(() => {
    setShowAddForm(true)
  }, [])

  const addEntity = () => {
    if (!newEntity.name.trim()) return
    const entity: Entity = {
      ...newEntity,
      id: Date.now().toString(),
    }
    setEntities([...entities, entity])
    setNewEntity({ name: '', health: 10, maxHealth: 10, initiative: 10, statuses: [] })
    setShowAddForm(false)
  }

  // Keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys when typing in inputs or when dialog is open
      const target = e.target as HTMLElement
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if (isInputField) return

      switch (e.key.toLowerCase()) {
        case 'n':
        case ' ': // Space
          e.preventDefault()
          nextTurn()
          break
        case 'r':
          e.preventDefault()
          resetCombat()
          break
        case 'a':
          e.preventDefault()
          openAddForm()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextTurn, resetCombat, openAddForm])

  const deleteEntity = (id: string) => {
    setEntities(entities.filter((e) => e.id !== id))
  }

  const updateEntity = (id: string, updates: Partial<Entity>) => {
    setEntities(entities.map((e) => (e.id === id ? { ...e, ...updates } : e)))
  }

  const toggleStatus = (entityId: string, status: string) => {
    const entity = entities.find((e) => e.id === entityId)
    if (!entity) return
    const newStatuses = entity.statuses.includes(status)
      ? entity.statuses.filter((s) => s !== status)
      : [...entity.statuses, status]
    updateEntity(entityId, { statuses: newStatuses })
  }

  const toggleNewEntityStatus = (status: string) => {
    const newStatuses = newEntity.statuses.includes(status)
      ? newEntity.statuses.filter((s) => s !== status)
      : [...newEntity.statuses, status]
    setNewEntity({ ...newEntity, statuses: newStatuses })
  }

  const getHealthColor = (health: number, maxHealth: number) => {
    const ratio = health / maxHealth
    if (ratio > 0.6) return 'bg-emerald-500'
    if (ratio > 0.3) return 'bg-amber-500'
    return 'bg-red-500'
  }


  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-purple-950 to-slate-900">
      {/* Header */}
      <div className="relative py-6 sm:py-8 px-4 sm:px-6 text-center overflow-hidden border-b-4 border-amber-500/50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDBWNDBIMHoiLz48cGF0aCBkPSJNMjAgMjBoMnYyaC0yem0tMTAgMGgydjJoLTJ6bTIwIDBoMnYyaC0yeiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvZz48L3N2Zz4=')] opacity-50"></div>
        <div className="relative">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2">
            <Swords className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight retro">
              <span className="text-amber-400">D2D</span>
            </h1>
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
          </div>
          <p className="text-amber-200/70 text-xs sm:text-sm tracking-widest uppercase">
            Combat Tracker
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-3 sm:p-6">
        {/* Round Counter & Controls */}
        <div className="sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 bg-slate-800/95 backdrop-blur-sm border-2 border-slate-600 p-3 sm:p-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-xs text-amber-200/70 uppercase tracking-wider mb-1">Round</div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 retro">{currentRound}</div>
            </div>
            {sortedEntities.length > 0 && (
              <div className="text-center border-l border-slate-600 pl-4 sm:pl-6">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Current Turn</div>
                <div className="text-base sm:text-lg font-bold text-white truncate max-w-[120px] sm:max-w-[150px]">
                  {sortedEntities[currentTurnIndex]?.name || '—'}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={nextTurn}
              disabled={sortedEntities.length === 0}
              className="flex-1 sm:flex-none"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="sm:inline">Next</span>
              <Kbd className="ml-1.5 hidden md:inline-flex">N</Kbd>
            </Button>
            <Button
              onClick={resetCombat}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden xs:inline">Reset</span>
              <Kbd className="ml-1.5 hidden md:inline-flex">R</Kbd>
            </Button>
            <Button
              onClick={openAddForm}
              className="flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Add</span>
              <Kbd className="ml-1.5 hidden md:inline-flex">A</Kbd>
            </Button>
          </div>
        </div>

        {/* Add Entity Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Entity</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  type="text"
                  value={newEntity.name}
                  onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
                  placeholder="Enter name..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Health</Label>
                  <Input
                    type="number"
                    value={newEntity.health}
                    onChange={(e) =>
                      setNewEntity({ ...newEntity, health: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max HP</Label>
                  <Input
                    type="number"
                    value={newEntity.maxHealth}
                    onChange={(e) =>
                      setNewEntity({ ...newEntity, maxHealth: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Initiative</Label>
                <Input
                  type="number"
                  value={newEntity.initiative}
                  onChange={(e) =>
                    setNewEntity({ ...newEntity, initiative: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Statuses</Label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <div key={status} className="flex items-center gap-2">
                      <Checkbox
                        id={`new-status-${status}`}
                        checked={newEntity.statuses.includes(status)}
                        onCheckedChange={() => toggleNewEntityStatus(status)}
                      />
                      <Label
                        htmlFor={`new-status-${status}`}
                        className="cursor-pointer"
                      >
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={addEntity}>
                <Check className="w-4 h-4" />
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Entity List */}
        <div className="space-y-4">
          {sortedEntities.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Swords className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg retro">No combatants yet</p>
              <p className="text-sm">Add an entity to begin tracking</p>
            </div>
          ) : (
            sortedEntities.map((entity, index) => (
              <EntityCard
                key={entity.id}
                ref={(el) => {
                  if (el) {
                    entityRefs.current.set(entity.id, el)
                  } else {
                    entityRefs.current.delete(entity.id)
                  }
                }}
                entity={entity}
                isActive={index === currentTurnIndex}
                isEditing={editingId === entity.id}
                onEdit={() => setEditingId(editingId === entity.id ? null : entity.id)}
                onDelete={() => deleteEntity(entity.id)}
                onUpdate={(updates) => updateEntity(entity.id, updates)}
                onToggleStatus={(status) => toggleStatus(entity.id, status)}
                getHealthColor={getHealthColor}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

interface EntityCardProps {
  entity: Entity
  isActive: boolean
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  onUpdate: (updates: Partial<Entity>) => void
  onToggleStatus: (status: string) => void
  getHealthColor: (health: number, maxHealth: number) => string
}

const EntityCard = forwardRef<HTMLDivElement, EntityCardProps>(function EntityCard(
  {
    entity,
    isActive,
    isEditing,
    onEdit,
    onDelete,
    onUpdate,
    onToggleStatus,
    getHealthColor,
  },
  ref
) {
  const [customAmount, setCustomAmount] = useState<number>(2)
  const healthPercent = Math.max(0, Math.min(100, (entity.health / entity.maxHealth) * 100))
  const isDead = entity.health <= 0

  const handleHeal = (amount: number) => {
    const newHealth = Math.min(entity.health + amount, entity.maxHealth)
    onUpdate({ health: newHealth })
  }

  const handleDamage = (amount: number) => {
    const newHealth = Math.max(entity.health - amount, 0)
    onUpdate({ health: newHealth })
  }

  return (
    <div
      ref={ref}
      className={`relative border-4 transition-all duration-300 ${isDead
        ? 'bg-gray-900/80 border-gray-700 grayscale'
        : isActive
          ? 'bg-linear-to-r from-amber-950/50 via-slate-800/80 to-amber-950/50 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4),0_0_40px_rgba(251,191,36,0.2)] ring-2 ring-amber-400/50 ring-offset-2 ring-offset-slate-900 animate-pulse-glow'
          : 'bg-slate-800/80 border-slate-600 hover:border-slate-500'
        }`}
    >
      {/* Dead Watermark */}
      {isDead && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="flex items-center gap-1 sm:gap-2 rotate-[-15deg]">
            <Skull className="w-8 h-8 sm:w-12 sm:h-12 text-red-500/50" />
            <span className="text-3xl sm:text-5xl font-black text-red-500/50 retro tracking-widest">DEAD</span>
            <Skull className="w-8 h-8 sm:w-12 sm:h-12 text-red-500/50" />
          </div>
        </div>
      )}

      {/* Initiative Badge */}
      <div
        className={`absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-sm sm:text-lg transition-all ${isDead
          ? 'bg-gray-600 text-gray-400'
          : isActive
            ? 'bg-amber-400 text-black scale-110 shadow-lg shadow-amber-400/50'
            : 'bg-slate-600 text-white'
          }`}
      >
        {entity.initiative}
      </div>

      {/* Active indicator */}
      {isActive && !isDead && (
        <Badge className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 animate-bounce bg-amber-400 text-black font-black text-[10px] sm:text-xs z-20">
          <span className="hidden sm:inline">⚔️ YOUR TURN ⚔️</span>
          <span className="sm:hidden">⚔️ TURN</span>
        </Badge>
      )}

      {/* Dead indicator */}
      {isDead && (
        <Badge variant="destructive" className="absolute -top-2 sm:-top-3 right-10 sm:right-12 text-[10px] sm:text-xs z-20">
          <Skull className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          DEAD
        </Badge>
      )}

      {/* Floating Action Buttons */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1 sm:gap-2 z-20">
        <Button
          onClick={onEdit}
          size="icon"
          variant={isEditing ? 'default' : 'outline'}
          className="w-7 h-7 sm:w-8 sm:h-8"
        >
          {isEditing ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
        </Button>
        <Button
          onClick={onDelete}
          size="icon"
          variant="destructive"
          className="w-7 h-7 sm:w-8 sm:h-8"
        >
          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </Button>
      </div>

      <div className={`p-3 sm:p-4 pl-10 sm:pl-12 ${isDead ? 'opacity-60' : ''}`}>
        <div className="flex items-start">
          {/* Main Info */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                type="text"
                value={entity.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="max-w-full sm:max-w-xs"
              />
            ) : (
              <h3 className={`text-lg sm:text-xl font-bold truncate retro ${isDead ? 'text-gray-500 line-through' : 'text-white'}`}>
                {entity.name}
              </h3>
            )}

            {/* Health Bar */}
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1">
                <Heart className={`w-4 h-4 ${isDead ? 'text-gray-500' : 'text-red-400'}`} />
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={entity.health}
                      onChange={(e) => onUpdate({ health: parseInt(e.target.value) || 0 })}
                      className="w-20"
                    />
                    <span className="text-gray-400">/</span>
                    <Input
                      type="number"
                      value={entity.maxHealth}
                      onChange={(e) => onUpdate({ maxHealth: parseInt(e.target.value) || 1 })}
                      className="w-20"
                    />
                  </div>
                ) : (
                  <span className={`text-sm ${isDead ? 'text-gray-500' : 'text-gray-300'}`}>
                    {entity.health} / {entity.maxHealth}
                  </span>
                )}
              </div>
              <div className={`h-3 border overflow-hidden ${isDead ? 'bg-gray-800 border-gray-700' : 'bg-slate-900 border-slate-600'}`}>
                <div
                  className={`h-full transition-all duration-500 ${isDead ? 'bg-gray-600' : getHealthColor(entity.health, entity.maxHealth)}`}
                  style={{ width: `${healthPercent}%` }}
                />
              </div>

              {/* Heal/Damage Buttons */}
              {!isEditing && (
                <div className="mt-2 flex flex-wrap items-center gap-1 sm:gap-2">
                  {/* Quick buttons */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDamage(1)}
                    className="text-xs sm:text-sm"
                  >
                    <Minus className="w-3 h-3" />
                    1
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDamage(5)}
                    className="text-xs sm:text-sm"
                  >
                    <Minus className="w-3 h-3" />
                    5
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleHeal(1)}
                    className="text-xs sm:text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    1
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleHeal(5)}
                    className="text-xs sm:text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    5
                  </Button>
                  {/* Custom amount */}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDamage(customAmount)}
                    className="shrink-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 sm:w-20 text-center"
                    min={1}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleHeal(customAmount)}
                    className="shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Initiative (editable) */}
            {isEditing && (
              <div className="mt-3 flex items-center gap-2">
                <Label>Initiative:</Label>
                <Input
                  type="number"
                  value={entity.initiative}
                  onChange={(e) => onUpdate({ initiative: parseInt(e.target.value) || 0 })}
                  className="w-20"
                />
              </div>
            )}

            {/* Statuses */}
            <div className="mt-3 flex flex-wrap gap-2">
              {isEditing ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                  {STATUS_OPTIONS.map((status) => (
                    <div key={status} className="flex items-center gap-2">
                      <Checkbox
                        id={`${entity.id}-status-${status}`}
                        checked={entity.statuses.includes(status)}
                        onCheckedChange={() => onToggleStatus(status)}
                      />
                      <Label
                        htmlFor={`${entity.id}-status-${status}`}
                        className="cursor-pointer"
                      >
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : entity.statuses.length > 0 ? (
                entity.statuses.map((status) => (
                  <Badge key={status}>
                    {status}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-gray-500 italic">No status effects</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
