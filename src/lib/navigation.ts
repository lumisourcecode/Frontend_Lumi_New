export const navigation = {
  public: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Book My Ride", href: "/book-my-ride" },
    { label: "Accessibility", href: "/accessibility" },
    { label: "Drive With Us", href: "/drive-with-us" },
    { label: "Partners", href: "/partners" },
    { label: "Help", href: "/help" },
    { label: "Login", href: "/login" },
  ],
  rider: [
    { label: "Dashboard", href: "/rider/dashboard" },
    { label: "Book", href: "/rider/book" },
    { label: "History", href: "/rider/history" },
    { label: "Profile", href: "/rider/profile" },
    { label: "Login", href: "/rider/login" },
  ],
  driver: [
    { label: "Login", href: "/driver/login" },
    { label: "Onboard", href: "/driver/onboard" },
    { label: "Dashboard", href: "/driver/dashboard" },
    { label: "Manifest", href: "/driver/manifest" },
    { label: "Profile", href: "/driver/profile" },
    { label: "Shift", href: "/driver/shift" },
    { label: "Earnings", href: "/driver/earnings" },
    { label: "Wallet", href: "/driver/wallet" },
    { label: "Incentives", href: "/driver/incentives" },
    { label: "Ratings", href: "/driver/ratings" },
    { label: "Vehicle", href: "/driver/vehicle" },
    { label: "Documents", href: "/driver/documents" },
    { label: "Support", href: "/driver/support" },
    { label: "Preferences", href: "/driver/preferences" },
  ],
  partner: [
    { label: "Login", href: "/partner/login" },
    { label: "Dashboard", href: "/partner/dashboard" },
    { label: "Profile", href: "/partner/profile" },
    { label: "Bookings", href: "/partner/bookings" },
    { label: "Travel Plans", href: "/partner/plans" },
    { label: "Live Operations", href: "/partner/live-operations" },
    { label: "Roster", href: "/partner/roster" },
    { label: "Clients", href: "/partner/clients" },
    { label: "Employees", href: "/partner/employees" },
    { label: "Bulk Upload", href: "/partner/bulk-upload" },
    { label: "Billing", href: "/partner/billing" },
    { label: "Reports", href: "/partner/reports" },
    { label: "Data Hub", href: "/partner/data-hub" },
    { label: "Help Center", href: "/partner/help-center" },
    { label: "Partners", href: "/partner/partners" },
  ],
  admin: [
    { label: "Login", href: "/admin/login" },
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Activity", href: "/admin/activity" },
    { label: "Dispatch", href: "/admin/dispatch" },
    { label: "Bookings", href: "/admin/bookings" },
    { label: "Users", href: "/admin/users" },
    { label: "Global Search", href: "/admin/search" },
    { label: "Riders", href: "/admin/riders" },
    { label: "Drivers", href: "/admin/drivers" },
    { label: "Partner Review", href: "/admin/partners" },
    { label: "Driver Enrollments", href: "/admin/enrollments" },
    { label: "CRM", href: "/admin/crm" },
    { label: "Client History", href: "/admin/trips-history" },
    { label: "Billing", href: "/admin/billing" },
    { label: "Payments", href: "/admin/payments" },
    { label: "Reviews", href: "/admin/reviews" },
    { label: "Reports", href: "/admin/reports" },
    { label: "Compliance", href: "/admin/compliance" },
    { label: "Settings", href: "/admin/settings" },
  ],
} as const;

export type RoleType = Exclude<keyof typeof navigation, "public">;

export const LOGIN_PATHS: Record<RoleType, string> = {
  rider: "/rider/login",
  driver: "/driver/login",
  partner: "/partner/login",
  admin: "/admin/login",
};

export function getNavItems(role: RoleType, isLoggedIn: boolean) {
  const items = navigation[role];
  if (!isLoggedIn) return items;
  return items.filter((item) => !item.href.endsWith("/login"));
}
