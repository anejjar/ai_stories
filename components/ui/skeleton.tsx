import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 bg-[length:200%_100%] animate-shimmer', className)}
      {...props}
    />
  )
}

export { Skeleton }

