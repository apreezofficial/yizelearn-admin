import {HugeiconsIcon} from '@hugeicons/react';
import {
  Award01Icon, ChartHistogramIcon, Upload01Icon, Alert02Icon, ArrowRight01Icon, Cancel01Icon, CreditCardIcon, DashboardSquare01Icon, File01Icon, GridViewIcon, Invoice01Icon, LaptopIcon, Logout01Icon,
  Mail01Icon, Megaphone01Icon, Message01Icon, MoreHorizontalIcon, Notification01Icon, PlusSignIcon, Search01Icon, Settings01Icon, SquareLock02Icon, StarIcon, Tag01Icon, Tick02Icon, UserGroupIcon, UserSwitchIcon,
} from '@hugeicons/core-free-icons';

// Same Hugeicons set as the mobile apps, by app name.
const icons = {
  dashboard: DashboardSquare01Icon, users: UserGroupIcon, courses: LaptopIcon, payments: CreditCardIcon, support: Message01Icon, settings: Settings01Icon,
  bell: Notification01Icon, search: Search01Icon, check: Tick02Icon, star: StarIcon, lock: SquareLock02Icon, close: Cancel01Icon, grid: GridViewIcon,
  receipt: Invoice01Icon, next: ArrowRight01Icon, logout: Logout01Icon, plus: PlusSignIcon, mail: Mail01Icon, more: MoreHorizontalIcon, alert: Alert02Icon,
  award: Award01Icon, chart: ChartHistogramIcon, upload: Upload01Icon, file: File01Icon, tag: Tag01Icon, role: UserSwitchIcon, announce: Megaphone01Icon,
};
export type IconName = keyof typeof icons;

export function Icon({name, size = 20, strokeWidth = 1.8, className}: {name: IconName; size?: number; strokeWidth?: number; className?: string}) {
  return <HugeiconsIcon icon={icons[name]} size={size} strokeWidth={strokeWidth} color="currentColor" className={className} aria-hidden />;
}
