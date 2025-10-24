import React from 'react';
import {
    Home,
    Car,
    ShoppingCart,
    Utensils,
    Gamepad2,
    Heart,
    Plane,
    Book,
    Music,
    Camera,
    Coffee,
    Gift,
    Zap,
    Star,
    DollarSign,
    CreditCard,
    PiggyBank,
    TrendingUp,
    ShoppingBag,
    Briefcase,
    GraduationCap,
    Stethoscope,
    Wrench,
    Paintbrush,
    Dumbbell,
    Palette,
    TreePine,
    Sun,
    Moon,
    Cloud,
    Umbrella,
    Tag,
    Plus,
    Edit,
    Trash2,
    Settings,
    User,
    Bell,
    Search,
    Filter,
    Download,
    Upload,
    Save,
    X,
    Check,
    AlertCircle,
    Info,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Clock,
    MapPin,
    Phone,
    Mail,
    Globe,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    MoreHorizontal,
    MoreVertical
} from 'lucide-react';

// Icon map for static imports
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'Home': Home,
    'Car': Car,
    'ShoppingCart': ShoppingCart,
    'Utensils': Utensils,
    'Gamepad2': Gamepad2,
    'Heart': Heart,
    'Plane': Plane,
    'Book': Book,
    'Music': Music,
    'Camera': Camera,
    'Coffee': Coffee,
    'Gift': Gift,
    'Zap': Zap,
    'Star': Star,
    'DollarSign': DollarSign,
    'CreditCard': CreditCard,
    'PiggyBank': PiggyBank,
    'TrendingUp': TrendingUp,
    'ShoppingBag': ShoppingBag,
    'Briefcase': Briefcase,
    'GraduationCap': GraduationCap,
    'Stethoscope': Stethoscope,
    'Wrench': Wrench,
    'Paintbrush': Paintbrush,
    'Dumbbell': Dumbbell,
    'Palette': Palette,
    'TreePine': TreePine,
    'Sun': Sun,
    'Moon': Moon,
    'Cloud': Cloud,
    'Umbrella': Umbrella,
    'Tag': Tag,
    'Plus': Plus,
    'Edit': Edit,
    'Trash2': Trash2,
    'Settings': Settings,
    'User': User,
    'Bell': Bell,
    'Search': Search,
    'Filter': Filter,
    'Download': Download,
    'Upload': Upload,
    'Save': Save,
    'X': X,
    'Check': Check,
    'AlertCircle': AlertCircle,
    'Info': Info,
    'ChevronDown': ChevronDown,
    'ChevronUp': ChevronUp,
    'ChevronLeft': ChevronLeft,
    'ChevronRight': ChevronRight,
    'Calendar': Calendar,
    'Clock': Clock,
    'MapPin': MapPin,
    'Phone': Phone,
    'Mail': Mail,
    'Globe': Globe,
    'Lock': Lock,
    'Unlock': Unlock,
    'Eye': Eye,
    'EyeOff': EyeOff,
    'MoreHorizontal': MoreHorizontal,
    'MoreVertical': MoreVertical
};

interface DynamicIconProps {
    name: string;
    className?: string;
    size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
    name,
    className = "w-5 h-5",
    size
}) => {
    const IconComponent = iconMap[name] || Tag;

    const iconProps = size
        ? { className: `w-${size} h-${size}` }
        : { className };

    return <IconComponent {...iconProps} />;
};

// Helper function for backward compatibility
export const getIconComponent = (iconName: string, className = "w-5 h-5") => {
    const IconComponent = iconMap[iconName] || Tag;
    return <IconComponent className={className} />;
};
