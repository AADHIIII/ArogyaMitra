'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  CalendarIcon as CalendarIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  UserCircleIcon as UserCircleIconSolid
} from '@heroicons/react/24/solid';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export default function MobileNavigation() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const patientNavigation = [
    { 
      name: 'Home', 
      href: '/dashboard', 
      icon: HomeIcon, 
      activeIcon: HomeIconSolid 
    },
    { 
      name: 'Search', 
      href: '/doctors', 
      icon: MagnifyingGlassIcon, 
      activeIcon: MagnifyingGlassIconSolid 
    },
    { 
      name: 'Appointments', 
      href: '/appointments', 
      icon: CalendarIcon, 
      activeIcon: CalendarIconSolid 
    },
    { 
      name: 'Messages', 
      href: '/messages', 
      icon: ChatBubbleLeftRightIcon, 
      activeIcon: ChatBubbleLeftRightIconSolid 
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: UserCircleIcon, 
      activeIcon: UserCircleIconSolid 
    }
  ];

  const doctorNavigation = [
    { 
      name: 'Home', 
      href: '/dashboard', 
      icon: HomeIcon, 
      activeIcon: HomeIconSolid 
    },
    { 
      name: 'Schedule', 
      href: '/schedule', 
      icon: CalendarIcon, 
      activeIcon: CalendarIconSolid 
    },
    { 
      name: 'Patients', 
      href: '/patients', 
      icon: MagnifyingGlassIcon, 
      activeIcon: MagnifyingGlassIconSolid 
    },
    { 
      name: 'Messages', 
      href: '/messages', 
      icon: ChatBubbleLeftRightIcon, 
      activeIcon: ChatBubbleLeftRightIconSolid 
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: UserCircleIcon, 
      activeIcon: UserCircleIconSolid 
    }
  ];

  const getNavigation = () => {
    switch (user?.role) {
      case 'DOCTOR':
        return doctorNavigation;
      case 'ADMIN':
      case 'CARE_COORDINATOR':
        return patientNavigation; // Use patient nav for admin for now
      default:
        return patientNavigation;
    }
  };

  const navigation = getNavigation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary-600"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon className="h-6 w-6" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}