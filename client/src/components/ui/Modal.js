import React, {useEffect} from "react";


function Modal(props) {


    const hideOnEsc = (e) => {
        if (e.keyCode === 27) props.changeShowModal(false)
    };

    useEffect(() => {

        document.addEventListener('keyup', hideOnEsc)

        return () => {
            document.removeEventListener('keyup', hideOnEsc)
        };

    }, [])


    return (
        <div className={
            "modal" +
            (!props.showModal ? " hideModal" : "") +
            (props.isCropModal ? " cropModal" : "") +
            (props.isImageModal ? " imageModal" : "") +
            (props.isProfileCropper ? " profileCropper" : "")
        }
        >


            <div className="backdrop"
                 onClick={
                     (e) => {
                         props.changeShowModal(false)
                     }
                 }
            />


            <div className="modal__content"
                 ref={props.modalRef}>
                
                <i className="cross"
                   onClick={
                       (e) => props.changeShowModal(false)
                   }
                />

                {props.children}


            </div>


        </div>
    );

}


export default Modal;
