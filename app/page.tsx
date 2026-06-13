import { redirect } from 'next/navigation'

export const metadata = {
  title: 'InsureAgent - Policy Reminder System',
  description: 'Professional insurance agent dashboard to manage client policies, set up automated reminders, and track renewals.',
}

export default function Page() {
  // Redirect to login page
  redirect('/login')
}
