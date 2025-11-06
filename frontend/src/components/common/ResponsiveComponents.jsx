import React from 'react'

// Responsive Container - Auto handles all screen sizes
export const Container = ({ children, className = '' }) => (
  <div className={`container-responsive ${className}`}>
    {children}
  </div>
)

// Responsive Card - Auto scales padding
export const Card = ({ children, className = '', onClick }) => (
  <div 
    className={`card-responsive ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
)

// Responsive Button - Auto scales size
export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false,
  type = 'button'
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/50',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-500/30',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    outline: 'border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10'
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-responsive ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

// Responsive Heading - Auto scales font size
export const Heading = ({ level = 1, children, className = '' }) => {
  const sizes = {
    1: 'heading-responsive-xl',
    2: 'heading-responsive-lg',
    3: 'heading-responsive-md',
    4: 'heading-responsive-sm'
  }
  
  const Tag = `h${level}`
  
  return (
    <Tag className={`${sizes[level]} ${className}`}>
      {children}
    </Tag>
  )
}

// Responsive Grid - Auto adjusts columns
export const Grid = ({ children, cols, className = '' }) => {
  const colClasses = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }
  
  return (
    <div className={`grid-responsive ${cols ? colClasses[cols] : ''} ${className}`}>
      {children}
    </div>
  )
}

// Responsive Section - Auto spacing
export const Section = ({ children, className = '' }) => (
  <section className={`section-spacing ${className}`}>
    {children}
  </section>
)

// Responsive Table Wrapper - Auto horizontal scroll on mobile
export const TableWrapper = ({ children, className = '' }) => (
  <div className={`table-responsive ${className}`}>
    {children}
  </div>
)

// Responsive Text - Auto scales
export const Text = ({ size = 'base', children, className = '' }) => {
  const sizes = {
    xs: 'text-responsive-xs',
    sm: 'text-responsive-sm',
    base: 'text-responsive-base',
    lg: 'text-responsive-lg',
    xl: 'text-responsive-xl'
  }
  
  return (
    <p className={`${sizes[size]} ${className}`}>
      {children}
    </p>
  )
}

// Responsive Modal - Auto scales on different screens
export const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="modal-responsive bg-slate-800 rounded-xl border border-slate-700 shadow-2xl">
        {title && (
          <div className="border-b border-slate-700 p-4 sm:p-6 flex items-center justify-between">
            <Heading level={3} className="text-white m-0">{title}</Heading>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// Responsive Sidebar Layout
export const SidebarLayout = ({ 
  sidebar, 
  children, 
  sidebarOpen, 
  onToggle 
}) => (
  <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
    {/* Mobile Toggle */}
    <button
      onClick={onToggle}
      className="lg:hidden btn-responsive bg-cyan-600/20 border-2 border-cyan-500/50 text-cyan-400"
    >
      {sidebarOpen ? '✕ Close Menu' : '☰ Open Menu'}
    </button>
    
    {/* Sidebar */}
    <div className={`${sidebarOpen ? 'block' : 'hidden lg:block'} lg:w-64`}>
      {sidebar}
    </div>
    
    {/* Main Content */}
    <div className="flex-1">
      {children}
    </div>
  </div>
)

// Responsive Stats Card
export const StatsCard = ({ icon: Icon, title, value, color = 'cyan', trend }) => {
  const colors = {
    cyan: 'from-cyan-600/20 to-blue-600/20 border-cyan-500/30',
    red: 'from-red-600/20 to-rose-600/20 border-red-500/30',
    green: 'from-green-600/20 to-emerald-600/20 border-green-500/30',
    purple: 'from-purple-600/20 to-indigo-600/20 border-purple-500/30'
  }
  
  return (
    <Card className={`bg-gradient-to-br ${colors[color]} border-2 p-4 sm:p-6`}>
      <div className="flex items-start justify-between mb-3">
        {Icon && <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />}
        {trend && (
          <span className={`text-xs sm:text-sm font-semibold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <Text size="sm" className="text-slate-300 uppercase tracking-wider font-semibold mb-2">
        {title}
      </Text>
      <Heading level={2} className="text-white m-0">
        {value}
      </Heading>
    </Card>
  )
}

// Responsive Alert/Toast
export const Alert = ({ type = 'info', children, onClose }) => {
  const types = {
    success: 'bg-green-500/10 border-green-500/50 text-green-400',
    error: 'bg-red-500/10 border-red-500/50 text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-400'
  }
  
  return (
    <div className={`${types[type]} border rounded-lg p-3 sm:p-4 flex items-center gap-3 animate-fade-in`}>
      <div className="flex-1 text-responsive-sm">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 p-1"
        >
          ✕
        </button>
      )}
    </div>
  )
}

// Responsive Badge
export const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-slate-700 text-slate-300',
    primary: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}

// Responsive Input
export const Input = ({ 
  label, 
  error, 
  className = '', 
  containerClassName = '',
  ...props 
}) => (
  <div className={containerClassName}>
    {label && (
      <label className="block text-responsive-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
    )}
    <input
      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-responsive-sm focus:outline-none focus:border-cyan-500 transition ${error ? 'border-red-500' : ''} ${className}`}
      {...props}
    />
    {error && (
      <Text size="xs" className="text-red-400 mt-1">{error}</Text>
    )}
  </div>
)

// Responsive Textarea
export const Textarea = ({ 
  label, 
  error, 
  className = '', 
  containerClassName = '',
  ...props 
}) => (
  <div className={containerClassName}>
    {label && (
      <label className="block text-responsive-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
    )}
    <textarea
      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-responsive-sm focus:outline-none focus:border-cyan-500 transition ${error ? 'border-red-500' : ''} ${className}`}
      {...props}
    />
    {error && (
      <Text size="xs" className="text-red-400 mt-1">{error}</Text>
    )}
  </div>
)

// Responsive Loading Spinner
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }
  
  return (
    <div className={`animate-spin rounded-full border-t-4 border-cyan-500 ${sizes[size]} ${className}`} />
  )
}

export default {
  Container,
  Card,
  Button,
  Heading,
  Grid,
  Section,
  TableWrapper,
  Text,
  Modal,
  SidebarLayout,
  StatsCard,
  Alert,
  Badge,
  Input,
  Textarea,
  LoadingSpinner
}