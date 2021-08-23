import React from "react";
import Modal from "./Modal";


function ImageModal(props) {


    return (
        <Modal
            showModal={props.showModal}
            changeShowModal={value => props.changeShowModal(value)}
            isImageModal={true}
        >
            <div className="modalBody">
                <img src={props.postImage} alt=""/>
            </div>

        </Modal>
    );

};


export default ImageModal;
