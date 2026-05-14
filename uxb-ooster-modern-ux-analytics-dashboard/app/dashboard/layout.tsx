import { DoctorProvider } from '@/lib/doctor-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DoctorProvider>{children}</DoctorProvider>
}
