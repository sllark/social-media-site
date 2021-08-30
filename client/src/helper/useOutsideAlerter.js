import {useEffect} from "react";

function useOutsideAlerter(ref, action, exclude, from) {

    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */


        function handleClickOutside(event) {

            let element;
            if (exclude)
                element = document.querySelector(exclude);

            let clickOnExclude = element && element.contains(event.target);

            if (ref.current
                && !ref.current.contains(event.target)
                && !clickOnExclude) {
                action();
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);
}

export default useOutsideAlerter