import Header from '@/components/ui/Header'
import TablaCliente from './TablaCliente'

export default function TablaPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <TablaCliente />
    </div>
  )
}
