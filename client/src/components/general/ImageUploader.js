import React, {useEffect, useRef, useState} from "react";
import "cropperjs/dist/cropper.css";
import ImageEditor from "../ui/ImageEditor";


function ImageUploader(props) {


    useEffect(() => {
        if (props.clearImage) {
            clearInput();
            props.setClearImage(false)
        }
    }, [props.clearImage])

    const [image, changeImage] = useState(undefined);
    const [showModal, changeShowModal] = useState(false);
    const inputRef = useRef();

    const imageChangeHandler = (e) => {

        if (e.target.files.length === 0) return;

        var file = e.target.files[0];

        props.setImageOriginalName(file.name);

        let reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = (e) => {
            changeImage(reader.result);
            props.setCropImage(reader.result);
        }

    }

    const clearInput = () => {

        changeImage("");
        props.setCropImage("");
        inputRef.current.value = ""
    }


    return (
        <>
            <div className="imageUploader">

                <input type="file" id="fileUpload" onChange={imageChangeHandler} ref={inputRef}/>
                <label htmlFor="fileUpload" accessKey="L">
                    <svg aria-hidden="true" data-prefix="fas" data-icon="image"
                         className="svg-inline--fa fa-image fa-w-16 fa-10x " role="img"
                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" color="#3B5998">
                        <path fill="currentColor"
                              d="M464 448H48c-26.51 0-48-21.49-48-48V112c0-26.51 21.49-48 48-48h416c26.51 0 48 21.49 48 48v288c0 26.51-21.49 48-48 48zM112 120c-30.928 0-56 25.072-56 56s25.072 56 56 56 56-25.072 56-56-25.072-56-56-56zM64 384h384V272l-87.515-87.515c-4.686-4.686-12.284-4.686-16.971 0L208 320l-55.515-55.515c-4.686-4.686-12.284-4.686-16.971 0L64 336v48z"></path>
                    </svg>

                </label>

                {
                    image &&
                    <div className="imageUploader__preview" tabIndex='1'>
                        <div className="imageUploader__preview__imageBox">

                            <div className="cross"
                                 onClick={clearInput}
                            />
                            <img src={props.cropImage} alt="" onClick={() => changeShowModal(true)} tabIndex='1'/>
                        </div>
                    </div>
                }

            </div>

            <ImageEditor
                showEditor={showModal}
                changeShowEditor={changeShowModal}
                image={image}
                setCropImage={props.setCropImage}
            />

        </>

    );

}

export default ImageUploader;
