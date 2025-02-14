import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/assessment/reports/')({
  component: RouteComponent,
})

function RouteComponent() {
return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}></div>
            Hello This is Report Page! coming Soon.....
        </div>
)
}
