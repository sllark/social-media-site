import React, {useState} from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import Modal from "../ui/Modal";
import Loading from "./Loading";


function ImageEditor(props) {


    const [cropper, setCropper] = useState("");


    const getCropData = () => {
        if (cropper !== undefined) {
            props.setCropImage(cropper.getCroppedCanvas().toDataURL());

            if (!props.onProfilePage) props.changeShowEditor(false);
        }
    };

    return (

        <Modal
            showModal={props.showEditor}
            changeShowModal={props.changeShowEditor}
            isCropModal={true}
            isProfileCropper={props.isProfileCropper}
        >
            <h2>
                {
                    props.isProfileCropper ? "Profile Image" : props.onProfilePage ? "Cover Image" : "Crop Image"
                }
            </h2>

            <div className="modalBody">

                {

                    props.isLoading ?
                        <Loading/>
                        :
                        <Cropper
                            style={{height: "80%", width: "100%"}}
                            zoomTo={0.5}
                            initialAspectRatio={1}
                            preview=".img-preview"
                            src={props.image}
                            viewMode={1}
                            minCropBoxHeight={10}
                            minCropBoxWidth={10}
                            background={false}
                            responsive={true}
                            autoCropArea={1}
                            checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                            onInitialized={(instance) => {
                                setCropper(instance);
                            }}
                            guides={true}
                        />


                }


                <button className="btn btn--primary" onClick={getCropData} disabled={props.isLoading}>
                    {props.isLoading ? 'Uploading Image...' : props.onProfilePage ? 'Set Image' : 'Crop'}
                </button>
            </div>

        </Modal>
    );

}

export default ImageEditor;
