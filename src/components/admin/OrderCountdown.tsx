import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface OrderCountdownProps {
  createdAt: string;
  estimatedMinutes: number;
  status: string;
}

const OrderCountdown = ({ createdAt, estimatedMinutes, status }: OrderCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    // Don't show countdown for delivered or cancelled orders
    if (status === 'delivered' || status === 'cancelled') {
      return;
    }

    const calculateTimeLeft = () => {
      const orderTime = new Date(createdAt).getTime();
      const estimatedDeliveryTime = orderTime + estimatedMinutes * 60 * 1000;
      const now = Date.now();
      const remaining = estimatedDeliveryTime - now;
      
      setTimeLeft(remaining);
      setIsOverdue(remaining <= 0);
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [createdAt, estimatedMinutes, status]);

  // Don't show for delivered or cancelled orders
  if (status === 'delivered' || status === 'cancelled') {
    return null;
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.abs(Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage (0-100)
  const totalTime = estimatedMinutes * 60 * 1000;
  const elapsed = totalTime - timeLeft;
  const progressPercent = Math.min(100, Math.max(0, (elapsed / totalTime) * 100));

  // Determine urgency level
  const isUrgent = !isOverdue && timeLeft <= 10 * 60 * 1000; // Less than 10 minutes
  const isWarning = !isOverdue && !isUrgent && timeLeft <= 20 * 60 * 1000; // Less than 20 minutes

  return (
    <div className="mt-2 space-y-1">
      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            isOverdue 
              ? 'bg-destructive' 
              : isUrgent 
                ? 'bg-orange-500' 
                : isWarning 
                  ? 'bg-yellow-500' 
                  : 'bg-primary'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Timer display */}
      <div className={`flex items-center gap-1.5 text-xs font-medium ${
        isOverdue 
          ? 'text-destructive' 
          : isUrgent 
            ? 'text-orange-500' 
            : isWarning 
              ? 'text-yellow-600' 
              : 'text-muted-foreground'
      }`}>
        {isOverdue ? (
          <>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Atrasado: +{formatTime(timeLeft)}</span>
          </>
        ) : (
          <>
            <Clock className="w-3.5 h-3.5" />
            <span>Tempo restante: {formatTime(timeLeft)}</span>
          </>
        )}
        <span className="text-muted-foreground ml-auto">
          (estimativa: {estimatedMinutes} min)
        </span>
      </div>
    </div>
  );
};

export default OrderCountdown;
