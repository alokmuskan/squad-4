import { motion } from "framer-motion";

interface FloatingCardProps {
  title: string;
  subtitle: string;
  badge: string;
  className?: string;
}

export default function FloatingCard({
  title,
  subtitle,
  badge,
  className,
}: FloatingCardProps) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute rounded-[32px] p-8 shadow-lg ${className}`}
    >
      <span className="bg-white/60 px-4 py-2 rounded-full text-xs font-semibold">
        {badge}
      </span>

      <h3 className="text-3xl font-bold mt-6">{title}</h3>

      <p className="text-gray-600 mt-3">{subtitle}</p>
    </motion.div>
  );
}

