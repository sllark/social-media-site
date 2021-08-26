import React, {useEffect, useRef, useState} from "react";
import axios from "axios";

import configs from "../../assets/config/configs";
import Modal from "../ui/Modal";
import Avatar from "../profile/Avatar";
import NameDisplay from "../ui/NameDisplay";
import ImageUploader from "../general/ImageUploader";

import dataURLtoFile from "../../helper/dataURLtoFile"


function CreateNewPost(props) {


    useEffect(() => {
        inputEl.current.focus();
    });

    const [postText, changeText] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [clearImage, setClearImage] = useState(false);
    const [cropImage, setCropImage] = useState("");
    const [imageOrignalName, setImageOriginalName] = useState("")

    const inputEl = useRef(null);


    const createPost = (e) => {

        let file,
            data = new FormData();
        data.append('postText', postText);


        if (cropImage) {
            file = dataURLtoFile(cropImage, imageOrignalName);
            data.append('imageFile', file);
        }


        let link = configs.api_url;
        axios({
            method: 'post',
            url: link + "/createPost",
            headers: {
                "Authorization": localStorage.getItem("token")
            },
            data: data
        })
            .then(result => {
                changeText("");
                props.addNewPost(result.data.post);
                setShowModal(false);
                setClearImage(true);
            })
            .catch(error => {
                console.log(error)
            })


    }


    return (
        <>
            <div className="createNewPost">

                <div className="createNewPost__front d-flex">

                    <Avatar/>
                    <input type="text"
                           value={postText}
                           placeholder={props.placeholder}
                           onChange={e => {
                               e.preventDefault();
                               // e.target.blur();
                               // changeText(e.target.value)
                           }}
                           onClick={e => {
                               e.preventDefault();
                               e.target.blur();
                               setShowModal(true);
                           }}
                           onFocus={e => {
                               e.preventDefault();
                               e.target.blur();
                               setShowModal(true);
                           }}
                    />

                </div>

            </div>

            <Modal showModal={showModal} changeShowModal={setShowModal}>
                <h2>Create Post</h2>
                <div className="modalBody">

                    <NameDisplay isActive={true} name="AbdulRehman"/>
                    <textarea
                        ref={inputEl}
                        placeholder={props.placeholder}
                        value={postText}
                        onChange={e => {
                            e.preventDefault();
                            // e.target.blur();
                            changeText(e.target.value)
                        }}
                    />

                    <ImageUploader
                        clearImage={clearImage}
                        setClearImage={setClearImage}
                        cropImage={cropImage}
                        setCropImage={setCropImage}
                        setImageOriginalName={setImageOriginalName}
                    />

                    <button
                        className="btn btn--primary"
                        disabled={postText.length < 1}
                        onClick={createPost}
                    >Post
                    </button>

                </div>
            </Modal>
        </>
    );

}


export default CreateNewPost;
