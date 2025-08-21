# 🚀 Post-Figma Development Roadmap

## 🎯 **Current Status: Ready for Frontend Development**

✅ **Backend API**: 100% Complete (50+ endpoints)  
✅ **Database**: Production-ready with Supabase  
✅ **Figma UI**: Complete design system + screens  
🎯 **Next Phase**: Frontend Development → Production Launch

---

## 📋 **Phase 1: Frontend Development Setup**

### **1.1 Initialize Next.js Project**
```bash
# Create Next.js project with TypeScript
npx create-next-app@latest arogyamitra-frontend --typescript --tailwind --eslint --app

# Navigate to project
cd arogyamitra-frontend

# Install essential dependencies
npm install @tanstack/react-query zustand react-hook-form @hookform/resolvers zod
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast
npm install lucide-react date-fns axios socket.io-client
npm install @types/node @types/react @types/react-dom

# Install development dependencies
npm install -D @types/socket.io-client prettier eslint-config-prettier
```

### **1.2 Project Structure Setup**
```
arogyamitra-frontend/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (patient)/         # Patient portal
│   │   ├── dashboard/
│   │   ├── doctors/
│   │   ├── appointments/
│   │   ├── medications/
│   │   └── layout.tsx
│   ├── (doctor)/          # Doctor portal
│   │   ├── dashboard/
│   │   ├── schedule/
│   │   ├── patients/
│   │   └── layout.tsx
│   ├── (admin)/           # Admin dashboard
│   │   ├── dashboard/
│   │   ├── users/
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── index.ts
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   └── features/          # Feature-specific components
├── lib/
│   ├── api.ts             # API client
│   ├── auth.ts            # Authentication utilities
│   ├── utils.ts           # Helper functions
│   └── validations.ts     # Zod schemas
├── stores/                # Zustand stores
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

### **1.3 Design System Implementation**
```typescript
// lib/design-tokens.ts
export const tokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a'
    },
    medical: {
      trust: '#0ea5e9',
      prescription: '#8b5cf6',
      vital: '#f43f5e'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif']
    }
  }
} as const;

// components/ui/button.tsx - Implement from Figma specs
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }))}
        {...props}
      />
    );
  }
);
```

---

## 🎨 **Phase 2: Component Development**

### **2.1 Core UI Components (Week 1)**
```typescript
// Priority Order:
1. Button (Primary, Secondary, Danger, Ghost)
2. Input (Text, Email, Password, Search)
3. Card (Doctor, Appointment, Medication)
4. Modal/Dialog (Booking, Confirmation)
5. Navigation (Header, Sidebar, Mobile)
6. Form Components (Field, Label, Error)
7. Loading States (Skeleton, Spinner)
8. Toast Notifications
```

### **2.2 Feature Components (Week 2)**
```typescript
// Healthcare-Specific Components:
1. DoctorCard - From Figma design with ratings, availability
2. AppointmentCard - Status, actions, timeline
3. AvailabilityCalendar - Date/time selection
4. MedicationTracker - Adherence monitoring
5. ChatInterface - Patient-doctor messaging
6. PrescriptionForm - Medication management
7. SearchFilters - Doctor search with filters
8. Dashboard widgets - Stats, charts, quick actions
```

### **2.3 Layout Components (Week 3)**
```typescript
// Layout System:
1. AuthLayout - Login/register pages
2. PatientLayout - Patient portal with navigation
3. DoctorLayout - Doctor portal with sidebar
4. AdminLayout - Admin dashboard
5. ResponsiveNavigation - Mobile/desktop navigation
6. ProtectedRoute - Authentication guards
```

---

## 🔌 **Phase 3: API Integration**

### **3.1 API Client Setup**
```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api',
  timeout: 10000,
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### **3.2 React Query Setup**
```typescript
// lib/react-query.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error.status === 404) return false;
        return failureCount < 3;
      },
    },
  },
});

// hooks/useAppointments.ts
export const useAppointments = () => {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: () => api.get('/appointments/my').then(res => res.data),
  });
};

export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BookAppointmentData) => 
      api.post('/appointments/book', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('Appointment booked successfully!');
    },
  });
};
```

### **3.3 Authentication Integration**
```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken } = response.data.data;
    
    localStorage.setItem('accessToken', accessToken);
    set({ user, token: accessToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
```

---

## 📱 **Phase 4: Page Implementation**

### **4.1 Authentication Pages**
```typescript
// app/(auth)/login/page.tsx
export default function LoginPage() {
  const { login } = useAuthStore();
  const router = useRouter();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (error) {
      toast.error('Invalid credentials');
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your ArogyaMitra account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Password field */}
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
```

### **4.2 Patient Dashboard**
```typescript
// app/(patient)/dashboard/page.tsx
export default function PatientDashboard() {
  const { data: appointments } = useAppointments();
  const { data: medications } = useMedications();
  const { data: stats } = usePatientStats();

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Good morning, John!</h1>
          <p className="text-gray-600">Your next appointment is in 2 hours</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Upcoming Appointments"
            value={stats?.upcomingAppointments || 0}
            icon={Calendar}
          />
          <StatsCard
            title="Active Medications"
            value={stats?.activeMedications || 0}
            icon={Pill}
          />
          <StatsCard
            title="Health Reports"
            value={stats?.healthReports || 0}
            icon={FileText}
          />
        </div>

        {/* Upcoming Appointments */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
          <div className="space-y-3">
            {appointments?.slice(0, 3).map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
          <Button variant="outline" className="mt-4">
            View All Appointments
          </Button>
        </section>

        {/* Today's Medications */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Today's Medications</h2>
          <div className="space-y-3">
            {medications?.slice(0, 3).map((medication) => (
              <MedicationCard key={medication.id} medication={medication} />
            ))}
          </div>
        </section>
      </div>
    </PatientLayout>
  );
}
```

---

## 🚀 **Phase 5: Advanced Features**

### **5.1 Real-time Features**
```typescript
// lib/socket.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002');

// hooks/useSocket.ts
export const useSocket = () => {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('notification', (notification) => {
      toast.info(notification.message);
    });

    socket.on('message', (message) => {
      // Handle new message
      queryClient.invalidateQueries(['messages']);
    });

    return () => {
      socket.off('connect');
      socket.off('notification');
      socket.off('message');
    };
  }, []);
};
```

### **5.2 Progressive Web App (PWA)**
```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // Next.js config
});

// public/manifest.json
{
  "name": "ArogyaMitra",
  "short_name": "ArogyaMitra",
  "description": "Your Healthcare Companion",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

---

## 🧪 **Phase 6: Testing & Quality Assurance**

### **6.1 Testing Setup**
```bash
# Install testing dependencies
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
npm install -D @testing-library/user-event msw

# Create test configuration
# jest.config.js, setupTests.ts, __tests__ folder
```

### **6.2 Component Testing**
```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🚀 **Phase 7: Production Deployment**

### **7.1 Environment Setup**
```bash
# Environment variables
NEXT_PUBLIC_API_URL=https://api.arogyamitra.com
NEXT_PUBLIC_SOCKET_URL=https://api.arogyamitra.com
NEXTAUTH_URL=https://arogyamitra.com
NEXTAUTH_SECRET=your-secret-key
```

### **7.2 Deployment Options**

#### **Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

#### **Option B: Docker + AWS/Railway**
```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 📊 **Phase 8: Monitoring & Analytics**

### **8.1 Error Tracking**
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### **8.2 Analytics**
```typescript
// lib/analytics.ts
import { Analytics } from '@vercel/analytics/react';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
}
```

---

## 🎯 **Timeline & Milestones**

### **Week 1-2: Foundation**
- ✅ Project setup and design system
- ✅ Core UI components
- ✅ Authentication flow

### **Week 3-4: Core Features**
- ✅ Patient portal (dashboard, doctor search, booking)
- ✅ Doctor portal (schedule, consultations)
- ✅ API integration

### **Week 5-6: Advanced Features**
- ✅ Real-time messaging
- ✅ Notifications
- ✅ Mobile responsiveness

### **Week 7-8: Polish & Deploy**
- ✅ Testing and bug fixes
- ✅ Performance optimization
- ✅ Production deployment

---

## 🎉 **Success Metrics**

### **Technical Metrics:**
- ✅ Lighthouse score >90
- ✅ Core Web Vitals passing
- ✅ 100% TypeScript coverage
- ✅ <3s page load time
- ✅ Mobile-responsive design

### **User Experience:**
- ✅ Intuitive navigation
- ✅ Accessible design (WCAG 2.1 AA)
- ✅ Real-time updates
- ✅ Offline capabilities (PWA)
- ✅ Cross-browser compatibility

**After completing this roadmap, you'll have a production-ready healthcare platform that rivals the best in the industry!** 🏥✨