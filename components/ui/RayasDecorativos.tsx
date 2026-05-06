export default function RayasDecorativas({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-3 w-full ${className}`}
      style={{
        background: 'repeating-linear-gradient(90deg, #1B2E5E 0px, #1B2E5E 20px, #FFFFFF 20px, #FFFFFF 40px)',
      }}
    />
  )
}

export function RayasHorizontales({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-2 w-full ${className}`}
      style={{
        background: 'repeating-linear-gradient(90deg, #1B2E5E 0px, #1B2E5E 16px, #C8A728 16px, #C8A728 20px)',
      }}
    />
  )
}
