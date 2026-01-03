import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from "react";

type CountdownControls = {
	start: () => void;
	stop: () => void;
	reset: (newValue?: number) => void;
};

const useCountdown = (initialValue: number = 0): [number, Dispatch<SetStateAction<number>>, CountdownControls] => {
	const [timeLeft, setTimeLeft] = useState(initialValue);
	const intervalRef = useRef<number | null>(null);

	const start = () => {
		if (intervalRef.current) return;
		intervalRef.current = setInterval(() => {
			setTimeLeft(prev => {
				if (prev <= 0) {
					stop();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	const stop = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	};

	const reset = (newValue: number = initialValue) => {
		stop();
		setTimeLeft(newValue);
	};

	useEffect(() => stop, []);

	return [timeLeft, setTimeLeft, { start, stop, reset }];
}

export default useCountdown;
