# 🚀 ArogyaMitra Advanced UI Development Guide

## 🎯 **Enterprise-Grade Design System Architecture**

### **Design Token System (CSS Custom Properties + TypeScript)**
```typescript
// tokens/colors.ts
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    500: '#3b82f6',
    600: '#2563eb',
    900: '#1e3a8a'
  },
  semantic: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  },
  medical: {
    trust: '#0ea5e9',
    prescription: '#8b5cf6',
    vital: '#f43f5e',
    wellness: '#22c55e'
  }
} as const;

// tokens/typography.ts
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace']
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }]
  }
} as const;
```### *
*Advanced Component Architecture with Compound Components**
```typescript
// components/ui/Button/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon, children, className, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800',
      secondary: 'bg-white text-primary-600 border border-primary-600 hover:bg-primary-50 focus:ring-primary-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
      ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
    };
    
    const sizes = {
      sm: 'px-3 py-2 text-sm rounded-md',
      md: 'px-4 py-2.5 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-lg'
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        {leftIcon && !loading && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);
```### **Adv
anced Form System with React Hook Form + Zod**
```typescript
// components/forms/FormField.tsx
interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
  required?: boolean;
  render: ({ field, fieldState }: { field: ControllerRenderProps<T>; fieldState: ControllerFieldState }) => React.ReactElement;
}

function FormField<T extends FieldValues>({ control, name, label, description, required, render }: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          {label && (
            <Label htmlFor={field.name} className={cn("text-sm font-medium", required && "after:content-['*'] after:text-red-500 after:ml-1")}>
              {label}
            </Label>
          )}
          {render({ field, fieldState })}
          {description && <p className="text-xs text-gray-500">{description}</p>}
          {fieldState.error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}

// Usage with advanced validation
const appointmentSchema = z.object({
  doctorId: z.string().uuid("Invalid doctor selection"),
  appointmentDate: z.date().min(new Date(), "Appointment must be in the future"),
  timeSlot: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  symptoms: z.string().min(10, "Please describe your symptoms (minimum 10 characters)").max(500, "Description too long"),
  consultationType: z.enum(["in-person", "video-call"]),
  urgency: z.enum(["routine", "urgent", "emergency"]).default("routine")
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const AppointmentBookingForm = () => {
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      consultationType: "in-person",
      urgency: "routine"
    }
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="symptoms"
        label="Describe your symptoms"
        required
        render={({ field }) => (
          <Textarea
            {...field}
            placeholder="Please describe your symptoms in detail..."
            className="min-h-[100px] resize-none"
          />
        )}
      />
    </Form>
  );
};
```#
# 🎨 **Advanced Figma Design System Specifications**

### **Atomic Design Methodology Implementation**
```
Design System Hierarchy:
├── 🔬 Atoms (Basic building blocks)
│   ├── Colors (Primary, Secondary, Semantic)
│   ├── Typography (Headings, Body, Labels)
│   ├── Icons (Medical, UI, Status)
│   ├── Spacing (4px, 8px, 16px, 24px, 32px, 48px, 64px)
│   └── Shadows (Subtle, Medium, Large, Colored)
│
├── ⚛️ Molecules (Simple combinations)
│   ├── Input Field (Label + Input + Error)
│   ├── Button Group (Multiple buttons)
│   ├── Search Bar (Input + Icon + Button)
│   ├── Avatar with Status (Image + Online indicator)
│   └── Rating Display (Stars + Count + Text)
│
├── 🧬 Organisms (Complex components)
│   ├── Navigation Header (Logo + Menu + User + Notifications)
│   ├── Doctor Card (Avatar + Info + Actions + Rating)
│   ├── Appointment Timeline (Multiple appointment items)
│   ├── Prescription Form (Multiple inputs + medications)
│   └── Chat Interface (Header + Messages + Input)
│
├── 📄 Templates (Page layouts)
│   ├── Dashboard Layout (Header + Sidebar + Content)
│   ├── Form Layout (Header + Form + Actions)
│   ├── List Layout (Header + Filters + Grid)
│   └── Detail Layout (Header + Content + Sidebar)
│
└── 🖼️ Pages (Complete screens)
    ├── Patient Dashboard
    ├── Doctor Search & Booking
    ├── Appointment Management
    └── Prescription Tracking
```

### **Advanced Color System with Semantic Tokens**
```css
/* CSS Custom Properties for Dynamic Theming */
:root {
  /* Primary Brand Colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;

  /* Semantic Colors */
  --color-success: #10b981;
  --color-success-light: #d1fae5;
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;

  /* Medical-Specific Colors */
  --color-medical-trust: #0ea5e9;
  --color-medical-prescription: #8b5cf6;
  --color-medical-vital: #f43f5e;
  --color-medical-wellness: #22c55e;

  /* Contextual Colors */
  --color-appointment-confirmed: #10b981;
  --color-appointment-pending: #f59e0b;
  --color-appointment-cancelled: #ef4444;
  --color-medication-taken: #10b981;
  --color-medication-missed: #ef4444;
  --color-medication-due: #f59e0b;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0f172a;
    --color-surface: #1e293b;
    --color-text-primary: #f8fafc;
    --color-text-secondary: #cbd5e1;
  }
}
```### 
**Advanced Typography System with Fluid Scaling**
```css
/* Fluid Typography using clamp() */
:root {
  --font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --font-size-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --font-size-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --font-size-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --font-size-2xl: clamp(1.5rem, 1.3rem + 1vw, 1.875rem);
  --font-size-3xl: clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem);
  --font-size-4xl: clamp(2.25rem, 1.9rem + 1.75vw, 3rem);

  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;

  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
}

/* Typography Classes */
.text-display-large {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.025em;
}

.text-heading-1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.text-body-large {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-relaxed);
}

.text-label-medium {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  letter-spacing: 0.025em;
}
```

### **Advanced Spacing System with Logical Properties**
```css
/* Spacing Scale using CSS Custom Properties */
:root {
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1-5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px */
  --space-2-5: 0.625rem;  /* 10px */
  --space-3: 0.75rem;     /* 12px */
  --space-3-5: 0.875rem;  /* 14px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-7: 1.75rem;     /* 28px */
  --space-8: 2rem;        /* 32px */
  --space-10: 2.5rem;     /* 40px */
  --space-12: 3rem;       /* 48px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
  --space-32: 8rem;       /* 128px */
}

/* Logical Properties for International Support */
.card {
  padding-block: var(--space-6);
  padding-inline: var(--space-4);
  margin-block-end: var(--space-4);
  border-inline-start: 4px solid var(--color-primary-500);
}

.stack > * + * {
  margin-block-start: var(--space-4);
}

.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: flex-start;
  align-items: center;
}
```## 🏗️ 
**Advanced Component Specifications**

### **Doctor Card - Enterprise Component**
```typescript
// types/doctor.ts
interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialties: Specialty[];
  profileImage?: string;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  isVerified: boolean;
  isAvailableToday: boolean;
  nextAvailableSlot?: Date;
  clinicName?: string;
  location: {
    city: string;
    state: string;
  };
}

// components/DoctorCard.tsx
interface DoctorCardProps {
  doctor: Doctor;
  variant?: 'default' | 'compact' | 'featured';
  showBookingButton?: boolean;
  onBook?: (doctorId: string) => void;
  onFavorite?: (doctorId: string) => void;
  isFavorited?: boolean;
  className?: string;
}

const DoctorCard = ({ doctor, variant = 'default', showBookingButton = true, onBook, onFavorite, isFavorited, className }: DoctorCardProps) => {
  const cardVariants = {
    default: 'p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200',
    compact: 'p-4 bg-white rounded-lg shadow-sm border border-gray-200',
    featured: 'p-8 bg-gradient-to-br from-primary-50 to-white rounded-2xl shadow-lg border border-primary-200'
  };

  return (
    <div className={cn(cardVariants[variant], className)}>
      {/* Header with Avatar and Favorite */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={doctor.profileImage} alt={`Dr. ${doctor.firstName} ${doctor.lastName}`} />
              <AvatarFallback className="bg-primary-100 text-primary-700">
                {doctor.firstName[0]}{doctor.lastName[0]}
              </AvatarFallback>
            </Avatar>
            {doctor.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Dr. {doctor.firstName} {doctor.lastName}
            </h3>
            <p className="text-sm text-gray-600">
              {doctor.specialties.map(s => s.name).join(', ')}
            </p>
          </div>
        </div>
        {onFavorite && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFavorite(doctor.id)}
            className="text-gray-400 hover:text-red-500"
          >
            <Heart className={cn("h-5 w-5", isFavorited && "fill-red-500 text-red-500")} />
          </Button>
        )}
      </div>

      {/* Rating and Reviews */}
      <div className="flex items-center space-x-2 mb-3">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < Math.floor(doctor.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-900">{doctor.rating}</span>
        <span className="text-sm text-gray-500">({doctor.reviewCount} reviews)</span>
      </div>

      {/* Consultation Fee */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <IndianRupee className="h-4 w-4 text-gray-500" />
          <span className="text-lg font-semibold text-gray-900">₹{doctor.consultationFee}</span>
          <span className="text-sm text-gray-500">consultation</span>
        </div>
        {doctor.isAvailableToday && (
          <Badge variant="success" className="text-xs">
            Available today
          </Badge>
        )}
      </div>

      {/* Location */}
      <div className="flex items-center space-x-2 mb-4">
        <MapPin className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          {doctor.clinicName && `${doctor.clinicName}, `}
          {doctor.location.city}, {doctor.location.state}
        </span>
      </div>

      {/* Next Available Slot */}
      {doctor.nextAvailableSlot && (
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Next available: {format(doctor.nextAvailableSlot, 'MMM dd, h:mm a')}
          </span>
        </div>
      )}

      {/* Actions */}
      {showBookingButton && (
        <div className="flex space-x-2">
          <Button
            onClick={() => onBook?.(doctor.id)}
            className="flex-1"
            disabled={!doctor.isAvailableToday}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
          <Button variant="secondary" size="sm">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
```### 
**Advanced Calendar Component with Availability**
```typescript
// components/AvailabilityCalendar.tsx
interface TimeSlot {
  time: string;
  available: boolean;
  price?: number;
}

interface AvailabilityCalendarProps {
  doctorId: string;
  selectedDate?: Date;
  selectedTime?: string;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  minDate?: Date;
  maxDate?: Date;
  unavailableDates?: Date[];
  className?: string;
}

const AvailabilityCalendar = ({ doctorId, selectedDate, selectedTime, onDateSelect, onTimeSelect, minDate = new Date(), maxDate, unavailableDates = [], className }: AvailabilityCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, doctorId]);

  const fetchAvailableSlots = async (date: Date) => {
    setLoading(true);
    try {
      const response = await api.get(`/appointments/doctors/${doctorId}/slots`, {
        params: { date: format(date, 'yyyy-MM-dd') }
      });
      setAvailableSlots(response.data.data.slots);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(unavailableDate => 
      isSameDay(date, unavailableDate)
    );
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, minDate) || 
           (maxDate && isAfter(date, maxDate)) ||
           isDateUnavailable(date);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Select Date</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            disabled={isBefore(subMonths(currentMonth, 1), startOfMonth(minDate))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            disabled={maxDate && isAfter(addMonths(currentMonth, 1), endOfMonth(maxDate))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {eachDayOfInterval({
          start: startOfWeek(startOfMonth(currentMonth)),
          end: endOfWeek(endOfMonth(currentMonth))
        }).map(date => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isDisabled = isDateDisabled(date);
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={date.toISOString()}
              onClick={() => !isDisabled && onDateSelect(date)}
              disabled={isDisabled}
              className={cn(
                "p-2 text-sm rounded-lg transition-colors duration-200",
                "hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500",
                {
                  "text-gray-300": !isCurrentMonth,
                  "text-gray-900": isCurrentMonth && !isSelected,
                  "bg-primary-600 text-white": isSelected,
                  "bg-primary-100 text-primary-700": isToday && !isSelected,
                  "opacity-50 cursor-not-allowed": isDisabled,
                  "font-semibold": isToday
                }
              )}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900">
            Available Times for {format(selectedDate, 'MMMM dd, yyyy')}
          </h4>
          
          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map(slot => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && onTimeSelect(slot.time)}
                  disabled={!slot.available}
                  className={cn(
                    "p-3 text-sm rounded-lg border transition-all duration-200",
                    "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500",
                    {
                      "border-gray-200 text-gray-900 hover:border-primary-300": slot.available && selectedTime !== slot.time,
                      "border-primary-600 bg-primary-600 text-white": selectedTime === slot.time,
                      "border-gray-100 text-gray-400 cursor-not-allowed": !slot.available
                    }
                  )}
                >
                  <div className="font-medium">{slot.time}</div>
                  {slot.price && (
                    <div className="text-xs opacity-75">₹{slot.price}</div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No available slots for this date</p>
              <p className="text-sm text-gray-400">Please select another date</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```#
# 🎯 **Advanced Layout Systems**

### **CSS Grid + Flexbox Hybrid Layout**
```css
/* Advanced Grid System */
.layout-grid {
  display: grid;
  grid-template-columns: 
    [full-start] minmax(1rem, 1fr) 
    [content-start] repeat(12, [col-start] 1fr [col-end]) 
    [content-end] minmax(1rem, 1fr) [full-end];
  gap: 1rem;
}

.layout-grid > * {
  grid-column: content;
}

.layout-grid .full-width {
  grid-column: full;
}

.layout-grid .content-width {
  grid-column: content;
}

/* Responsive Grid Areas */
.dashboard-layout {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 240px 1fr 300px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 1rem;
}

@media (max-width: 768px) {
  .dashboard-layout {
    grid-template-areas: 
      "header"
      "main"
      "footer";
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    left: -100%;
    height: 100vh;
    transition: left 0.3s ease;
    z-index: 50;
  }
  
  .sidebar.open {
    left: 0;
  }
}

/* Container Queries for Component-Level Responsiveness */
.doctor-card-container {
  container-type: inline-size;
}

@container (max-width: 300px) {
  .doctor-card {
    flex-direction: column;
    text-align: center;
  }
  
  .doctor-card .avatar {
    margin: 0 auto 1rem;
  }
}

@container (min-width: 400px) {
  .doctor-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
    align-items: center;
  }
}
```

### **Advanced Animation System**
```css
/* CSS Custom Properties for Animations */
:root {
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;
  
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Micro-interactions */
.button {
  transition: all var(--duration-normal) var(--ease-out);
  transform: translateY(0);
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.button:active {
  transform: translateY(0);
  transition-duration: var(--duration-fast);
}

/* Loading States */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.loading-skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.spinner {
  animation: spin 1s linear infinite;
}

.slide-in-up {
  animation: slideInUp var(--duration-normal) var(--ease-out);
}

/* Stagger Animations */
.stagger-children > * {
  animation: slideInUp var(--duration-normal) var(--ease-out);
}

.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 50ms; }
.stagger-children > *:nth-child(3) { animation-delay: 100ms; }
.stagger-children > *:nth-child(4) { animation-delay: 150ms; }
.stagger-children > *:nth-child(5) { animation-delay: 200ms; }
```## 
🔧 **Advanced State Management Architecture**

### **Zustand Store with TypeScript**
```typescript
// stores/appointmentStore.ts
interface AppointmentState {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  filters: AppointmentFilters;
  loading: boolean;
  error: string | null;
}

interface AppointmentActions {
  fetchAppointments: (filters?: AppointmentFilters) => Promise<void>;
  bookAppointment: (data: BookAppointmentData) => Promise<void>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  cancelAppointment: (id: string, reason: string) => Promise<void>;
  setSelectedAppointment: (appointment: Appointment | null) => void;
  setFilters: (filters: Partial<AppointmentFilters>) => void;
  clearError: () => void;
}

type AppointmentStore = AppointmentState & AppointmentActions;

export const useAppointmentStore = create<AppointmentStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      appointments: [],
      selectedAppointment: null,
      filters: {
        status: undefined,
        dateRange: undefined,
        doctorId: undefined,
      },
      loading: false,
      error: null,

      // Actions
      fetchAppointments: async (filters) => {
        set((state) => {
          state.loading = true;
          state.error = null;
          if (filters) state.filters = { ...state.filters, ...filters };
        });

        try {
          const response = await appointmentApi.getAppointments(get().filters);
          set((state) => {
            state.appointments = response.data;
            state.loading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch appointments';
            state.loading = false;
          });
        }
      },

      bookAppointment: async (data) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const response = await appointmentApi.bookAppointment(data);
          set((state) => {
            state.appointments.unshift(response.data);
            state.loading = false;
          });
          
          // Show success notification
          toast.success('Appointment booked successfully!');
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to book appointment';
            state.loading = false;
          });
          throw error;
        }
      },

      updateAppointment: async (id, data) => {
        const optimisticUpdate = get().appointments.find(apt => apt.id === id);
        
        // Optimistic update
        set((state) => {
          const index = state.appointments.findIndex(apt => apt.id === id);
          if (index !== -1) {
            state.appointments[index] = { ...state.appointments[index], ...data };
          }
        });

        try {
          const response = await appointmentApi.updateAppointment(id, data);
          set((state) => {
            const index = state.appointments.findIndex(apt => apt.id === id);
            if (index !== -1) {
              state.appointments[index] = response.data;
            }
          });
        } catch (error) {
          // Revert optimistic update
          if (optimisticUpdate) {
            set((state) => {
              const index = state.appointments.findIndex(apt => apt.id === id);
              if (index !== -1) {
                state.appointments[index] = optimisticUpdate;
              }
            });
          }
          
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to update appointment';
          });
          throw error;
        }
      },

      setSelectedAppointment: (appointment) => {
        set((state) => {
          state.selectedAppointment = appointment;
        });
      },

      setFilters: (filters) => {
        set((state) => {
          state.filters = { ...state.filters, ...filters };
        });
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },
    })),
    { name: 'appointment-store' }
  )
);

// Custom hooks for specific use cases
export const useAppointments = () => {
  const { appointments, loading, error, fetchAppointments } = useAppointmentStore();
  
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return { appointments, loading, error };
};

export const useAppointmentActions = () => {
  const { bookAppointment, updateAppointment, cancelAppointment } = useAppointmentStore();
  return { bookAppointment, updateAppointment, cancelAppointment };
};
```

### **React Query Integration for Server State**
```typescript
// hooks/useAppointments.ts
export const useAppointments = (filters?: AppointmentFilters) => {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => appointmentApi.getAppointments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error.status === 404) return false;
      return failureCount < 3;
    },
  });
};

export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: appointmentApi.bookAppointment,
    onSuccess: (data) => {
      // Invalidate and refetch appointments
      queryClient.invalidateQueries(['appointments']);
      
      // Optimistically update the cache
      queryClient.setQueryData(['appointments'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: [data, ...old.data],
        };
      });
      
      toast.success('Appointment booked successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to book appointment');
    },
  });
};

export const useAvailableSlots = (doctorId: string, date: string) => {
  return useQuery({
    queryKey: ['available-slots', doctorId, date],
    queryFn: () => appointmentApi.getAvailableSlots(doctorId, date),
    enabled: !!doctorId && !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
```## 
🎨 **Advanced Figma Design Specifications**

### **Component Variants System**
```
Button Component Variants:
├── Property: Variant
│   ├── Primary (Default)
│   ├── Secondary  
│   ├── Danger
│   └── Ghost
├── Property: Size
│   ├── Small (32px height)
│   ├── Medium (40px height) - Default
│   └── Large (48px height)
├── Property: State
│   ├── Default
│   ├── Hover
│   ├── Active
│   ├── Disabled
│   └── Loading
└── Property: Icon
    ├── None (Default)
    ├── Left Icon
    ├── Right Icon
    └── Icon Only

Doctor Card Component Variants:
├── Property: Layout
│   ├── Default (320x280px)
│   ├── Compact (320x200px)
│   └── Featured (360x320px)
├── Property: State
│   ├── Default
│   ├── Hover (elevated shadow)
│   ├── Selected (blue border)
│   └── Loading (skeleton)
└── Property: Actions
    ├── Book Only
    ├── Book + Message
    └── View Profile
```

### **Auto Layout Specifications**
```
Card Component Auto Layout:
├── Direction: Vertical
├── Spacing: 16px
├── Padding: 20px (all sides)
├── Fill container: Horizontal
├── Hug contents: Vertical
├── Max width: 400px
└── Min height: 200px

Navigation Auto Layout:
├── Direction: Horizontal
├── Spacing: 24px
├── Padding: 16px horizontal, 12px vertical
├── Fill container: Horizontal
├── Align: Space between
└── Items align: Center

Form Field Auto Layout:
├── Direction: Vertical
├── Spacing: 6px
├── Fill container: Horizontal
├── Hug contents: Vertical
└── Gap between label and input: 6px
```

### **Advanced Prototyping Interactions**
```
Smart Animate Transitions:
├── Page transitions: 300ms ease-out
├── Modal open/close: 250ms ease-in-out
├── Dropdown expand: 200ms ease-out
├── Button hover: 150ms ease-out
└── Loading states: 400ms ease-in-out

Overlay Interactions:
├── Modal backdrop: 40% black overlay
├── Dropdown shadow: 0 10px 25px rgba(0,0,0,0.1)
├── Tooltip: 0 4px 6px rgba(0,0,0,0.1)
└── Toast: Slide in from top-right

Scroll Interactions:
├── Sticky navigation: After scroll 100px
├── Parallax hero: 0.5x scroll speed
├── Infinite scroll: Trigger at 80% scroll
└── Back to top: Show after 300px scroll

Gesture Interactions:
├── Swipe cards: Horizontal drag 50px threshold
├── Pull to refresh: Vertical drag 80px threshold
├── Pinch to zoom: 1x to 3x scale range
└── Long press: 500ms hold duration
```

### **Responsive Breakpoint System**
```
Figma Frame Sizes:
├── Mobile Portrait: 375x812px (iPhone 13)
├── Mobile Landscape: 812x375px
├── Tablet Portrait: 768x1024px (iPad)
├── Tablet Landscape: 1024x768px
├── Desktop Small: 1280x720px
├── Desktop Medium: 1440x900px
└── Desktop Large: 1920x1080px

Component Responsive Behavior:
├── Navigation
│   ├── Mobile: Bottom tabs + hamburger
│   ├── Tablet: Top nav + sidebar toggle
│   └── Desktop: Full sidebar + top nav
├── Cards
│   ├── Mobile: 1 column, full width
│   ├── Tablet: 2 columns, 16px gap
│   └── Desktop: 3-4 columns, 20px gap
└── Forms
    ├── Mobile: Single column, stacked
    ├── Tablet: 2 columns where appropriate
    └── Desktop: Multi-column with logical grouping
```

### **Accessibility Specifications**
```
Color Contrast Requirements:
├── Normal text: 4.5:1 minimum ratio
├── Large text (18px+): 3:1 minimum ratio
├── UI components: 3:1 minimum ratio
└── Focus indicators: 3:1 minimum ratio

Touch Target Sizes:
├── Minimum: 44x44px (iOS/Android standard)
├── Recommended: 48x48px
├── Spacing: 8px minimum between targets
└── Icon buttons: 40x40px minimum

Focus Management:
├── Focus order: Logical tab sequence
├── Focus indicators: 2px blue outline
├── Skip links: "Skip to main content"
└── Keyboard navigation: All interactive elements

Screen Reader Support:
├── Alt text: All images and icons
├── Labels: All form inputs
├── Headings: Proper hierarchy (H1-H6)
├── Landmarks: Main, nav, aside, footer
└── Live regions: Status updates and errors
```

## 🚀 **Production-Ready Implementation**

This advanced guide provides enterprise-level specifications for building a world-class healthcare platform UI. Every component, interaction, and system is designed with:

- **Performance**: Optimized rendering and state management
- **Accessibility**: WCAG 2.1 AA compliance
- **Scalability**: Modular architecture for team collaboration  
- **Maintainability**: Type-safe, well-documented code
- **User Experience**: Intuitive, delightful interactions
- **Healthcare Standards**: Medical-grade reliability and trust

**Ready to build a cutting-edge healthcare platform that rivals the best in the industry!** 🏥✨