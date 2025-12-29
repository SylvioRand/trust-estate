import type { FC } from "react"

interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
}

const Separator: FC<SeparatorProps> = ({ orientation = "horizontal" }) =>
{
  const horizontalClasses = "h-0.5 w-full bg-linear-to-r from-transparent via-gray-400 to-transparent";
  const verticalClasses = "w-0.5 h-full bg-linear-to-b from-transparent via-gray-400 to-transparent";
  
  return (
    <div className={orientation === "horizontal" ? horizontalClasses : verticalClasses}></div>
  )
}

export default Separator