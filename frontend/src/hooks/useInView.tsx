import { useEffect, useRef, useState } from "react";

const	useInView = (options?: IntersectionObserverInit) => {
	const	ref = useRef<HTMLDivElement | null>(null);
	const	[isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const	observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				setIsVisible(true);
				observer.disconnect();
			}
		}, options);

		if (ref.current)
			observer.observe(ref.current);

		return (() => observer.disconnect())
	}, [options]);

	return ({ ref, isVisible });
}

export default useInView;
